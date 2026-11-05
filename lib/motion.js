// Small helpers for writing render(t). All pure functions: same input, same output.
const M = {
  clamp: (x, a = 0, b = 1) => Math.min(b, Math.max(a, x)),
  // 0→1 progress of t between start and end seconds
  progress: (t, start, end) => M.clamp((t - start) / (end - start)),
  lerp: (a, b, p) => a + (b - a) * p,
  // Map t in [start,end] to [from,to] with an easing curve
  tween: (t, start, end, from, to, ease = M.ease.inOutCubic) =>
    M.lerp(from, to, ease(M.progress(t, start, end))),
  ease: {
    linear: p => p,
    outCubic: p => 1 - Math.pow(1 - p, 3),
    inCubic: p => p * p * p,
    inOutCubic: p => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2),
    outBack: p => { const c = 1.70158; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); },
    outExpo: p => (p === 1 ? 1 : 1 - Math.pow(2, -10 * p)),
  },
};
window.M = M;
