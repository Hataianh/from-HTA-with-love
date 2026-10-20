// Use numeric transforms for browser compatibility. The frame-based fallback
// moves cached layers, so neither backend redraws the flower artwork.
const TAU = Math.PI * 2;
const sineOut = 'cubic-bezier(.33,.52,.66,1)';
const sineIn = 'cubic-bezier(.33,0,.66,.48)';

export function createWindController(onEngine = () => {}) {
  let entries = [];
  let animations = [];
  let frame = 0;
  let probe = 0;
  let running = false;
  let paused = false;
  let mode = 'stopped';
  let nativeFailed = false;
  let startedAt = 0;
  let pausedAt = 0;

  function stop() {
    running = false; paused = false;
    cancelAnimationFrame(frame); frame = 0;
    clearTimeout(probe); probe = 0;
    for (const animation of animations) animation.cancel();
    animations = [];
    for (const { node } of entries) node.style.transform = 'rotate(0rad)';
    entries = [];
    mode = 'stopped'; onEngine(mode);
  }

  function tick(now) {
    frame = 0;
    if (!running || paused) return;
    const elapsed = now - startedAt;
    for (const { node, amplitude, duration, delay } of entries) {
      const time = Math.max(0, elapsed - delay);
      const angle = -amplitude * Math.sin(TAU * time / duration);
      node.style.transform = `rotate(${angle}rad)`;
    }
    frame = requestAnimationFrame(tick);
  }

  function fallback() {
    nativeFailed = true;
    clearTimeout(probe); probe = 0;
    for (const animation of animations) animation.cancel();
    animations = [];
    for (const { node } of entries) node.style.transform = 'rotate(0rad)';
    mode = 'frame'; onEngine(mode);
    startedAt = performance.now();
    if (running && !paused) frame = requestAnimationFrame(tick);
  }

  function checkPlayback() {
    clearTimeout(probe);
    if (!running || paused || mode !== 'waapi') return;
    const before = entries.map(({ node }) => getComputedStyle(node).transform);
    const delay = Math.max(0, ...entries.map(entry => entry.delay)) + 900;
    probe = setTimeout(() => {
      if (!running || paused || document.hidden || mode !== 'waapi') return;
      const moved = entries.some(({ node }, index) => getComputedStyle(node).transform !== before[index]);
      if (!moved) fallback();
    }, delay);
  }

  return {
    get running() { return running; },
    start(nodes) {
      stop();
      entries = Array.from(nodes, node => ({
        node,
        amplitude: Number(node.dataset.wind),
        duration: Number(node.dataset.period),
        delay: Number(node.dataset.delay),
      }));
      if (!entries.length) return;
      running = true;
      if (nativeFailed) { fallback(); return; }
      try {
        for (const { node, amplitude, duration, delay } of entries) {
          if (typeof node.animate !== 'function') throw new Error('Web Animations unavailable');
          const animation = node.animate([
            { transform: 'rotate(0rad)', offset: 0, easing: sineOut },
            { transform: `rotate(${-amplitude}rad)`, offset: .25, easing: sineIn },
            { transform: 'rotate(0rad)', offset: .5, easing: sineOut },
            { transform: `rotate(${amplitude}rad)`, offset: .75, easing: sineIn },
            { transform: 'rotate(0rad)', offset: 1 },
          ], { duration, delay, iterations: Infinity, fill: 'both' });
          if (!animation || typeof animation.cancel !== 'function' || typeof animation.pause !== 'function' || typeof animation.play !== 'function') throw new Error('Incomplete Web Animations implementation');
          animations.push(animation);
        }
        mode = 'waapi'; onEngine(mode);
        checkPlayback();
      } catch {
        fallback();
      }
    },
    pause() {
      if (!running || paused) return;
      paused = true; pausedAt = performance.now();
      clearTimeout(probe); cancelAnimationFrame(frame); frame = 0;
      for (const animation of animations) animation.pause();
    },
    resume() {
      if (!running || !paused) return;
      paused = false;
      if (mode === 'frame') {
        startedAt += performance.now() - pausedAt;
        frame = requestAnimationFrame(tick);
      } else {
        for (const animation of animations) animation.play();
        checkPlayback();
      }
    },
    stop,
  };
}
