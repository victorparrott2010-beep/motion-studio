# motion-studio
Alicia Lyttle Workshop

Motion graphics videos written as code. Each video is one HTML file in `videos/` that sets
`window.DURATION` (seconds), `window.SIZE` ([width, height]) and `window.render(t)`, which draws the exact
frame at time `t`. There are no CSS animations or timers, so every render comes out the same.

## Render

Needs Node 18+, ffmpeg (with libx264) and Playwright with Chromium (`npm install playwright && npx playwright install chromium`).

```bash
node render.mjs videos/capacity-explainer.html                    # out/capacity-explainer.mp4 (30 fps)
node render.mjs videos/capacity-explainer.html --size 1080x1350   # Instagram layout
node render.mjs videos/capacity-explainer.html --stills 3         # 3 evenly spaced stills
node render.mjs videos/capacity-explainer.html --at 11.5,14.9     # stills at exact times
```

## Layout

- `brand.css` - brand colors (palette + roles; burgundy is the default background) and fonts
- `fonts/` - Instrument Serif and Inter Tight (SIL Open Font License), loaded locally so renders work offline
- `assets/` - logo
- `lib/motion.js` - easing and tween helpers for `render(t)`
- `videos/` - one HTML file per video
- `templates/` - reusable briefs
- `out/` - rendered videos and stills
