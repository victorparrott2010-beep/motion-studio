#!/usr/bin/env node
// Render a video HTML file to MP4 (or a few stills) using headless Chromium + ffmpeg.
//
//   node render.mjs videos/hello.html            -> out/hello.mp4
//   node render.mjs videos/hello.html --stills 3 -> out/hello-still-1.png ... 3
//   options: --fps 30 (default 30), --size 1080x1350 (alternate layout -> out/<name>-1080x1350.mp4)
//
// Contract for a video file: it sets window.DURATION (seconds), window.SIZE ([w, h])
// and window.render(t), which draws the exact frame for time t (seconds).

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(ROOT, 'out');

// ---- args ----
const args = process.argv.slice(2);
const input = args.find(a => !a.startsWith('--') && !/^\d+$/.test(a));
const opt = name => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
// --at 11.5,14.9 : stills at exact times (seconds) instead of evenly spaced ones
const atTimes = opt('at') ? opt('at').split(',').map(Number) : null;
const stills = atTimes ? atTimes.length : (opt('stills') ? parseInt(opt('stills'), 10) : 0);
const fps = opt('fps') ? parseInt(opt('fps'), 10) : 30;
// --size 1080x1350: render an alternate layout. The video reads ?size=WxH from its URL.
const sizeArg = opt('size');
if (sizeArg && !/^\d+x\d+$/.test(sizeArg)) { console.error('--size must look like 1080x1350'); process.exit(1); }

if (!input || !existsSync(input)) {
  console.error('Usage: node render.mjs videos/<name>.html [--stills N | --at 1.5,4] [--fps 30] [--size WxH]');
  process.exit(1);
}
const name = path.basename(input, '.html') + (sizeArg ? `-${sizeArg}` : '');
mkdirSync(OUT, { recursive: true });

// ---- open the page ----
const browser = await chromium.launch();
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('[page error]', e.message));
  page.on('console', m => { if (m.type() === 'error') console.error('[page console]', m.text()); });

  if (sizeArg) { const [w, h] = sizeArg.split('x').map(Number); await page.setViewportSize({ width: w, height: h }); }
  const url = pathToFileURL(path.resolve(input)).href + (sizeArg ? `?size=${sizeArg}` : '');
  await page.goto(url, { waitUntil: 'load' });
  // Load every @font-face up front so no frame renders with a fallback font.
  await page.evaluate(async () => { await Promise.all([...document.fonts].map(f => f.load().catch(() => {}))); await document.fonts.ready; });

  const { DURATION, SIZE, hasRender } = await page.evaluate(() => ({
    DURATION: window.DURATION, SIZE: window.SIZE, hasRender: typeof window.render === 'function',
  }));
  if (!(DURATION > 0) || !Array.isArray(SIZE) || !hasRender) {
    throw new Error('Video must set window.DURATION (>0), window.SIZE [w,h] and window.render(t).');
  }
  const [width, height] = SIZE;
  if (sizeArg && `${width}x${height}` !== sizeArg) {
    throw new Error(`This video doesn't support --size ${sizeArg} (it reported ${width}x${height}).`);
  }
  await page.setViewportSize({ width, height });

  const frameAt = async t => {
    await page.evaluate(async t => { await window.render(t); }, t);
    return page.screenshot({ type: 'png', clip: { x: 0, y: 0, width, height } });
  };

  if (stills > 0) {
    // Evenly spaced through the video, centered in each slice (e.g. 3 -> 1/6, 3/6, 5/6).
    for (let k = 0; k < stills; k++) {
      const t = atTimes ? atTimes[k] : DURATION * (k + 0.5) / stills;
      const file = path.join(OUT, atTimes ? `${name}-at-${t}s.png` : `${name}-still-${k + 1}.png`);
      writeFileSync(file, await frameAt(t));
      console.log(`still ${k + 1}/${stills} at t=${t.toFixed(2)}s -> ${path.relative(ROOT, file)}`);
    }
  } else {
    const total = Math.round(DURATION * fps);
    const file = path.join(OUT, `${name}.mp4`);
    // Pipe PNG frames straight into ffmpeg; no temp files.
    const ff = spawn('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '16',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
      // yuv420p needs even dimensions
      '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
      file,
    ], { stdio: ['pipe', 'inherit', 'inherit'] });
    const done = new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error(`ffmpeg exited ${c}`))));

    for (let i = 0; i < total; i++) {
      const png = await frameAt(i / fps);
      if (!ff.stdin.write(png)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % fps === 0 || i === total - 1) process.stdout.write(`\rframe ${i + 1}/${total}`);
    }
    ff.stdin.end();
    await done;
    console.log(`\n${total} frames @ ${fps}fps, ${width}x${height} -> ${path.relative(ROOT, file)}`);
  }
} finally {
  await browser.close();
}
