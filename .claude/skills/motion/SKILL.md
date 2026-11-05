---
name: motion
description: Make motion graphics videos as code in this studio, for Cyber Capitol Management. Use whenever the user asks for a video, animation, explainer, promo, title card, social clip or animated chart, or wants to change, re-render or check stills of an existing video in videos/. Works from a CROWN brief (Context, Result, Off-limits, shoW your work, Never twice), always uses brand.css, shows a storyboard and stills before rendering, and saves approved briefs to templates/.
---

# Motion studio

Videos are code. Each video is one HTML file in `videos/` that draws the exact frame for any time `t`.
`render.mjs` opens it in headless Chromium, captures every frame at 30 fps and joins them into an MP4 with ffmpeg.

## Hard rules

1. **Always use `brand.css`.** Every video links `../brand.css` and uses only its role tokens and fonts.
   Never write a hex code, named color, or font into a video. If a design needs a color the brand doesn't have,
   ask the user rather than inventing one. The only exception is the logo image, which keeps its own shading.
2. **No brief, no build.** If the request isn't a CROWN brief, or a brief is missing parts, ask for them first (see below).
3. **Storyboard, then stills, then render.** Never render an MP4 the user hasn't seen stills of.
4. **When editing, change only what was asked.** Don't restyle, retime, reword or "improve" anything else.
5. **Never invent numbers.** Charts, stats, prices, percentages, counts and dates come only from the user.
   If data is missing, ask. Never use placeholder or "example" figures, never round or extrapolate, and never
   add axes, totals or labels the user didn't supply.
6. **Only the user's words appear on screen.** No added taglines, labels like "Step", or filler copy.
7. **Save every approved brief to `templates/`** (see Never twice).

## The studio

| Path | What it is |
|---|---|
| `brand.css` | Palette (`--burgundy #5E1A28`, `--gold #E2B34A`, `--camel #C19A6B`, `--light-camel #E6D2B0`), roles, `@font-face` for local fonts, no-animation safety net |
| `fonts/` | Instrument Serif (headlines) and Inter Tight (body), OFL, loaded locally so renders work offline |
| `assets/logo.webp` | Shield logo, transparent background. Use it on end cards. |
| `lib/motion.js` | `M.tween(t, start, end, from, to, ease)`, `M.progress`, `M.lerp`, `M.clamp`, `M.ease.*` |
| `videos/*.html` | One file per video |
| `templates/` | Approved briefs. `explainer-brief.md` is the first one. |
| `out/` | Rendered MP4s and stills |
| `render.mjs` | The renderer |

### Brand roles (use these, not palette names)

| Token | Color | Use | Contrast on burgundy |
|---|---|---|---|
| `--bg` | burgundy | background (brand default) | — |
| `--ink` | light camel | main text, headlines | 7.7:1 |
| `--accent` | gold | big numbers, bars, highlights, button fills | 5.8:1 |
| `--muted` | camel | secondary lines, outlines, dimmed text | 4.9:1 |
| `--on-accent` | burgundy | text on gold fills (buttons) | 5.8:1 |
| `--font-display` | Instrument Serif | headlines (only weight 400, plus italic; never set it bold) | |
| `--font-body` | Inter Tight | body text, buttons, labels (weights 100-900) | |

The user disliked the camel background because gold is hard to see on it. Keep burgundy as the background
unless they ask otherwise. Never put gold or light camel text on camel.

## Step 1: Get a CROWN brief

If the user hasn't given one, reply with this to fill in. Pre-fill whatever they've already said,
and offer `templates/` briefs as starting points when one fits:

```
C - CONTEXT: Who it's for and where it plays (YouTube / website / Instagram / all).
R - RESULT: Length in seconds, size(s), title, and the exact on-screen text for every scene
    (e.g. steps: headline + one small line each; end card: call to action + any sub-heading).
    For charts: every number, label and unit, plus the source.
O - OFF-LIMITS: What must not appear (default: no stock footage, no people, no words I didn't write,
    no colors outside brand.css).
W - SHOW YOUR WORK: Storyboard with timings before code; stills before the full render.
N - NEVER TWICE: Save the approved brief to templates/ with [brackets] for the parts that change.
```

Then, before the storyboard, ask about anything ambiguous. Use AskUserQuestion with concrete options
when you can. Things that came up before:
- **Text that can't be split as asked** (e.g. a word list when the brief wants headline + line): ask, don't guess.
- **Spelling of names.** It's "Cyber **Capitol** Management" (after the nation's Capitol), not "Capital".
- **Platform → size.** 1920x1080 suits YouTube and websites; 1080x1350 suits the Instagram feed.
  "Both" means one file with two layouts, not two files.
- **Whether to use the logo** (default: on the end card).

## Step 2: Storyboard (wait for OK)

Give a table: time range | scene | what moves. Include the layout for each size, and state that only the
user's words and brand.css colors will be used. Don't write code until the user approves.

The approved explainer storyboard (15 s) is a good default for step-based videos:
title rises word by word, large and centered, with a gold underline → shrinks to a header → each step
comes in one at a time (gold number scales up, gold bar draws, headline slides in, line fades in;
earlier steps soften to 40%) → recap with all steps at full strength → title and steps drift up and fade →
logo, company name, gold call-to-action button and sub-heading fade in, holding to the last frame.

## Step 3: Build

Start from the closest existing video (`videos/capacity-explainer.html` for explainers). Keep all on-screen
text in one `COPY` object at the top of the script.

**Video contract:**
```js
window.DURATION = 15;                 // seconds
window.SIZE = [1920, 1080];           // [width, height]
window.render = (t) => { ... };       // set every animated property from t alone
window.render(0);                     // so the file previews in a browser
```

**Rules for `render(t)`:**
- Pure function of `t`. No CSS animations or transitions (brand.css disables them anyway), no timers,
  no `Date`, no `Math.random()` (use a seeded generator if you need noise). Every render must come out identical.
- Every element's state must come from `t` alone, including things that already finished or haven't
  started yet, because frames can be rendered in any order.
- Use `M.tween` with easing (`outCubic`, `outBack`, `inOutCubic`, `outExpo`). Smooth moves, no hard cuts.
- Give `#stage` a fixed pixel width and height from `SIZE`, and measure layout from it.

**Two sizes from one file:** read `new URLSearchParams(location.search).get('size')`. When it's `1080x1350`,
set `SIZE` to that and add a `tall` class to `body` (otherwise `wide`). Write CSS for `.wide` and `.tall`:
wide puts items side by side, tall stacks them. `render.mjs --size 1080x1350` passes `?size=1080x1350`
and refuses to run if the video reports a different size.

**Charts:** draw them with DOM/SVG inside `render(t)` (bars grow, lines draw, counters count). Values come
only from the brief, written into `COPY` exactly as given, with the unit and source shown on screen if the
user provided them. A counter animates toward the user's exact value and lands on it. If a value is
missing or unclear, stop and ask.

**Readability:** use `text-wrap: balance` on multi-line text to avoid single words left on a line.
Keep body text at 26 px or larger at 1080 p.

## Step 4: Stills (wait for OK)

```bash
node render.mjs videos/<name>.html --stills 3
node render.mjs videos/<name>.html --stills 3 --size 1080x1350
node render.mjs videos/<name>.html --at 11.5,14.9
```

`--stills 3` takes stills at 1/6, 3/6 and 5/6 of the duration, and can miss short scenes.
That happened once: Step 3 was in none of the three stills and the user thought it was missing.
Always also use `--at` to show a frame where every scene's content is visible, plus the final frame.
Read each still yourself before sending it, and check for clipped text, overlaps, orphaned words and contrast.
Fix problems first, then send the stills with SendUserFile and say what each one shows.

## Step 5: Render

Only after the user approves the stills (e.g. "render it"):

```bash
node render.mjs videos/<name>.html
node render.mjs videos/<name>.html --size 1080x1350
```

Output: `out/<name>.mp4` and `out/<name>-1080x1350.mp4` (H.264, yuv420p, CRF 16, 30 fps, no audio).
Check them with `ffprobe` (frame count = DURATION × 30, correct size) and send them with SendUserFile.
Mention there's no sound track unless the brief asked for one.

## Editing an existing video

Change only what the user asked for. Before editing, fingerprint the current stills:

```bash
md5sum out/<name>*-still-*.png out/<name>*-at-*.png > <scratchpad>/before.md5
```

After the edit, re-render the same stills. Frames the change shouldn't affect must be byte-identical.
For changes that shouldn't alter the look at all (refactors, token renames), run `md5sum -c` and confirm
every still matches. Then show stills of what did change, and wait for "render it" before the full render.

If a requested change has a side effect (e.g. a burgundy background makes a burgundy panel wipe invisible),
explain it and propose the smallest fix in the same reply, rather than silently changing more.

## Never twice

When the user approves a video, save its brief as `templates/<short-name>-brief.md`:
- the CROWN brief, with [brackets] for everything that changes between videos
  (title, steps, call to action, platform, length, data...);
- the approved storyboard table;
- the reference build (`videos/<name>.html`) and the render commands.

If the video came from an existing template and the user changed how it should work, update that template
instead of making a new one. Tell the user where it's saved.

## Wrap-up

This studio is the `victorparrott2010-beep/motion-studio` repo. Cloud sessions are temporary, so after
approved work, offer to commit and push to `main`, including `out/`.
