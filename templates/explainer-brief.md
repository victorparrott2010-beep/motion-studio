# Explainer video brief (template)

Copy everything below the line into a new message and fill in the [brackets].
Reference build: `videos/capacity-explainer.html`, the approved "Create Capacity for Growth" video.
To make a new one, copy that file and change only the COPY block at the top.

---

CONTEXT: I run Cyber Capitol Management for Small Business Owners. This video plays on [YOUTUBE / MY WEBSITE / INSTAGRAM / ALL] for [AUDIENCE].

RESULT: A [15]-second animated explainer using brand.css (burgundy background), in two sizes from one file:
1920x1080 (YouTube / website) and 1080x1350 (Instagram, via --size 1080x1350).

- Title: "[TITLE]"
- Then these steps appear one at a time, each with a big gold number, a short headline and one small line under it:
  1. [STEP 1 HEADLINE] - [STEP 1 LINE]
  2. [STEP 2 HEADLINE] - [STEP 2 LINE]
  3. [STEP 3 HEADLINE] - [STEP 3 LINE]
- End card: the logo (assets/logo.webp), "Cyber Capitol Management", a gold button reading "[CALL TO ACTION]",
  and this sub-heading under it: "[CTA SUB-HEADING]"
- Smooth easing, no hard cuts.

OFF-LIMITS: No stock footage, no people, no words I didn't write, no colors outside brand.css
(the logo keeps its own shading). If anything is unclear, ask me before you build.

SHOW YOUR WORK: Before you write code, give me a scene-by-scene storyboard with timings and wait for my OK.
After you build it, run --stills 3 for both sizes and show me the stills before the full render.
Also show a still with all steps on screen (--at 11.5) and the final frame (--at 14.9),
since the evenly spaced stills can miss a step.

NEVER TWICE: When I approve the video, save any changes to this brief back into templates/.

---

## Approved storyboard (15 seconds)

| Time | Scene |
|---|---|
| 0.0-2.5s | Title rises in word by word, large and centered, in light camel; gold underline draws in |
| 2.5-3.2s | Title shrinks and glides to the top as a header |
| 3.2-5.8s | Step 1: gold number scales in, gold bar draws, headline slides in, line fades in |
| 5.8-8.4s | Step 2 the same; step 1 softens |
| 8.4-11.0s | Step 3 the same; step 2 softens |
| 11.0-11.8s | Recap: all steps return to full strength |
| 11.8-12.5s | Title and steps drift up and fade out |
| 12.4-15.0s | Logo, company name, call-to-action button and sub-heading fade in; hold to the last frame |

Layouts: wide puts the steps side by side; Instagram stacks them, with the number on the left.

## Commands

```bash
node render.mjs videos/<name>.html --stills 3
node render.mjs videos/<name>.html --at 11.5,14.9
node render.mjs videos/<name>.html
node render.mjs videos/<name>.html --size 1080x1350
```

Add `--size 1080x1350` to any still command to check the Instagram version.
