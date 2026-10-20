// Cache petals, stems and complete plants. One canvas handles opening; each
// cached cluster then sways independently using composited CSS transforms.
const PALETTE = [338, 344, 350, 18, 28, 84, 96, 192, 202];
const LAYERS = [
  { count: 18, height: .26, spread: .23, radius: 21, opacity: .70 },
  { count: 24, height: .39, spread: .25, radius: 29, opacity: .84 },
  { count: 28, height: .53, spread: .24, radius: 37, opacity: .95 },
  { count: 30, height: .72, spread: .20, radius: 44, opacity: 1 },
  { count: 32, height: .91, spread: .17, radius: 50, opacity: 1 },
];
const TAU = Math.PI * 2;
const clamp = (value) => Math.max(0, Math.min(1, value));
const smooth = (value) => { const t = clamp(value); return t * t * (3 - 2 * t); };
function randomSource(seed) {
  return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
}

function stemSprite(depth, variant) {
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 800;
  const ctx = canvas.getContext('2d');
  const bend = variant ? 15 : -13;
  const green = ['#7c9d7d', '#69946e', '#50875e', '#377c50', '#307348'][depth];
  ctx.strokeStyle = green; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.moveTo(80, 0);
  ctx.bezierCurveTo(80 + bend, 250, 80 - bend, 570, 80 + bend * .6, 800);
  ctx.stroke();
  const leaf = (x, y, direction) => {
    ctx.save(); ctx.translate(x, y); ctx.scale(direction, 1);
    const fill = ctx.createLinearGradient(0, 0, 50, -35);
    fill.addColorStop(0, green); fill.addColorStop(1, '#80a779');
    ctx.fillStyle = fill;
    ctx.beginPath(); ctx.moveTo(0, 0);
    ctx.bezierCurveTo(10, -29, 38, -18, 59, -48);
    ctx.bezierCurveTo(58, -17, 33, 9, 0, 0);
    ctx.fill();
    ctx.strokeStyle = '#a2bf915c'; ctx.lineWidth = 1.1;
    ctx.beginPath(); ctx.moveTo(2, -1); ctx.lineTo(50, -37); ctx.stroke();
    ctx.restore();
  };
  leaf(80 + bend * .2, 290, -1);
  leaf(80 - bend * .15, 485, 1);
  return canvas;
}

export function createGarden(container, getBlossomUrl, reducedMotion) {
  let frame = 0;
  let start = null;
  let active = false;
  let destroyed = false;
  let paused = false;
  let resized = false;
  let width = 0, height = 0;
  let seedFlowers = [];
  let readyComplete = false;
  const heads = new Map();
  const stems = LAYERS.map((_, depth) => [stemSprite(depth, 0), stemSprite(depth, 1)]);
  const layers = LAYERS.map((_, depth) => {
    const canvas = document.createElement('canvas');
    canvas.className = 'garden-canvas';
    canvas.style.setProperty('--depth', depth);
    canvas.setAttribute('aria-hidden', 'true');
    container.appendChild(canvas);
    return { canvas, ctx: canvas.getContext('2d'), flowers: [] };
  });

  const motionCanvas = document.createElement('canvas');
  motionCanvas.className = 'garden-motion';
  motionCanvas.setAttribute('aria-hidden', 'true');
  container.appendChild(motionCanvas);
  container.dataset.animation = 'idle';
  container.dataset.renderer = reducedMotion ? 'still' : 'wind';
  const motionCtx = motionCanvas.getContext('2d');
  const sprigs = document.createElement('div');
  sprigs.className = 'garden-sprigs';
  container.appendChild(sprigs);

  // Rasterize each petal design once instead of resizing vector paths per frame.
  const ready = Promise.all(PALETTE.flatMap(hue => [0, 1].map(async variant => {
    const image = new Image();
    image.src = getBlossomUrl(hue, variant);
    await image.decode();
    const bitmap = document.createElement('canvas');
    bitmap.width = bitmap.height = 256;
    bitmap.getContext('2d').drawImage(image, 0, 0, 256, 256);
    heads.set(`${hue}-${variant}`, bitmap);
  }))).then(() => { readyComplete = true; if (!resize()) paintStatic(); });

  function makeLayout() {
    const random = randomSource(20261020);
    const mobile = width <= 700;
    const unit = Math.max(.7, Math.min(1.12, width / 1200));
    seedFlowers = [];
    layers.forEach((layer, depth) => {
      const settings = LAYERS[depth];
      const count = mobile ? [12, 16, 20, 24, 26][depth] : settings.count;
      layer.flowers = [];
      for (let index = 0; index < count; index++) {
        const x = (index + random() * .85) / Math.max(1, count - 1) * 1.08 - .04;
        // Large waves, alternating tall/short stems and distinct front/back sizes.
        const ridge = Math.sin(x * TAU * 1.8 + depth * 1.9) * .6
          + Math.sin(x * TAU * 4.1 - depth * .8) * .4;
        const stagger = (index % 3 === 0 ? -.14 : index % 3 === 1 ? .10 : .02);
        const y = clamp(settings.height + ridge * settings.spread + stagger + (random() - .5) * .10);
        const radius = (settings.radius + (random() - .5) * 15) * unit;
        const flower = {
          x: x * width,
          y: Math.max(radius + 6, y * height),
          radius,
          ground: height + 25 + random() * 45,
          angle: (random() - .5) * .30,
          hue: PALETTE[Math.floor(random() * PALETTE.length)],
          variant: index % 2,
          opacity: settings.opacity,
          phase: random() * TAU,
          frequency: .65 + random() * .38,
          sway: .027 + random() * .024,
          delay: Math.abs(x - .5) * .95 + depth * .19 + random() * .35,
          duration: 2.7 + random() * .7,
        };
        layer.flowers.push(flower); seedFlowers.push(flower);
      }
      // Low blooms are painted over taller neighbours for an irregular canopy.
      layer.flowers.sort((a, b) => a.y - b.y);
      layer.canvas.dataset.flowers = String(layer.flowers.length);
    });
    container.dataset.flowers = String(seedFlowers.length);
  }

  function resize() {
    const rect = container.getBoundingClientRect();
    const nextWidth = Math.round(rect.width);
    const nextHeight = Math.round(rect.height);
    if (!nextWidth || !nextHeight || (width === nextWidth && height === nextHeight)) return false;
    width = nextWidth; height = nextHeight;
    const dpr = Math.min(devicePixelRatio || 1, width <= 700 ? 2 : 1.5);
    for (const { canvas, ctx } of layers) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }
    const motionDpr = Math.min(devicePixelRatio || 1, 1.25);
    motionCanvas.width = Math.round(width * motionDpr);
    motionCanvas.height = Math.round(height * motionDpr);
    motionCtx.setTransform(motionDpr, 0, 0, motionDpr, 0, 0);
    motionCtx.imageSmoothingEnabled = true;
    motionCtx.imageSmoothingQuality = 'medium';
    makeLayout();
    if (readyComplete) paintStatic();
    if (active && readyComplete) draw(performance.now());
    return true;
  }

  function paintFlower(ctx, depth, flower, time) {
    if (!time) return;
    const opened = smooth(time);
    const grown = 1 - Math.pow(1 - time, 3);
    const plantY = flower.ground - (flower.ground - flower.y) * grown;
    const headRadius = flower.radius * (.07 + .93 * opened);
    const stemHeight = Math.max(0, flower.ground - plantY);
    ctx.globalAlpha = flower.opacity * Math.min(1, time * 5);
    ctx.save();
    ctx.translate(flower.x, flower.ground);
    ctx.rotate(flower.angle * grown);
    ctx.drawImage(stems[depth][flower.variant], -30, -stemHeight, 60, stemHeight);
    ctx.drawImage(heads.get(`${flower.hue}-${flower.variant}`), -headRadius, -stemHeight - headRadius, headRadius * 2, headRadius * 2);
    ctx.restore();
  }

  function paintStatic() {
    if (!reducedMotion) {
      const fragment = document.createDocumentFragment();
      const dpr = Math.min(devicePixelRatio || 1, 1.5);
      const clusterCount = width <= 700 ? 4 : 6;
      for (let depth = 0; depth < layers.length; depth++) {
        const clusters = Array.from({ length: clusterCount }, () => []);
        for (const flower of layers[depth].flowers) {
          const index = Math.max(0, Math.min(clusterCount - 1, Math.floor(flower.x / width * clusterCount)));
          clusters[index].push(flower);
        }
        clusters.forEach((flowers, index) => {
          if (!flowers.length) return;
          const bounds = flowers.map(f => {
            const stemHeight = f.ground - f.y;
            const headX = f.x + Math.sin(f.angle) * stemHeight;
            const headY = f.ground - Math.cos(f.angle) * stemHeight;
            return { left: Math.min(f.x - 34, headX - f.radius - 5), right: Math.max(f.x + 34, headX + f.radius + 5), top: headY - f.radius - 6 };
          });
          const left = Math.floor(Math.min(...bounds.map(b => b.left)));
          const right = Math.ceil(Math.max(...bounds.map(b => b.right)));
          const top = Math.max(0, Math.floor(Math.min(...bounds.map(b => b.top))));
          const clusterWidth = right - left;
          const clusterHeight = Math.max(1, height - top);
          const plant = document.createElement('canvas');
          plant.className = 'garden-sprig';
          plant.dataset.depth = String(depth);
          plant.dataset.flowers = String(flowers.length);
          const resolution = Math.min(dpr, depth < 3 ? 1 : 1.25);
          plant.width = Math.ceil(clusterWidth * resolution);
          plant.height = Math.ceil(clusterHeight * resolution);
          const lead = flowers[0];
          const wind = (.022 + depth * .003) * ((index + depth) % 2 ? -1 : 1);
          plant.style.cssText = `left:${left}px;top:${top}px;width:${clusterWidth}px;height:${clusterHeight}px;--lean:0rad;--wind:${wind}rad;--period:${(Math.PI * 2 / lead.frequency).toFixed(2)}s;--delay:${(lead.phase / Math.PI * .3).toFixed(2)}s`;
          const ctx = plant.getContext('2d');
          ctx.setTransform(resolution, 0, 0, resolution, -left * resolution, -top * resolution);
          for (const flower of flowers) paintFlower(ctx, depth, flower, 1);
          fragment.appendChild(plant);
        });
      }
      sprigs.replaceChildren(fragment);
      return;
    }
    for (let depth = 0; depth < layers.length; depth++) {
      const { ctx, flowers } = layers[depth];
      ctx.clearRect(0, 0, width, height);
      for (const flower of flowers) paintFlower(ctx, depth, flower, 1);
      ctx.globalAlpha = 1;
    }
  }

  function draw(now) {
    const elapsed = reducedMotion ? 20 : start === null ? 20 : (now - start) / 1000;
    let finished = true;
    motionCtx.clearRect(0, 0, width, height);
    for (let depth = 0; depth < layers.length; depth++) {
      for (const flower of layers[depth].flowers) {
        const time = clamp((elapsed - flower.delay) / flower.duration);
        if (time < 1) finished = false;
        paintFlower(motionCtx, depth, flower, time);
      }
    }
    motionCtx.globalAlpha = 1;
    return finished;
  }

  function tick(now) {
    frame = 0;
    if (!active || destroyed || paused) return;
    if (!draw(now)) frame = requestAnimationFrame(tick);
    else container.dataset.animation = 'idle';
  }

  const observer = new ResizeObserver(() => {
    if (resized) return;
    resized = true;
    requestAnimationFrame(() => { resized = false; if (!destroyed) resize(); });
  });
  observer.observe(container);

  document.addEventListener('visibilitychange', () => {
    cancelAnimationFrame(frame); frame = 0;
    if (!document.hidden && active && !paused) frame = requestAnimationFrame(tick);
  });

  return {
    ready,
    bloom() {
      active = true;
      start = performance.now();
      container.dataset.animation = 'blooming';
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(tick);
    },
    pause() {
      paused = true;
      cancelAnimationFrame(frame); frame = 0;
    },
    resume() {
      paused = false;
      if (active && !document.hidden) {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(tick);
      }
    },
    reset() {
      active = false; start = null;
      cancelAnimationFrame(frame); frame = 0;
      motionCtx.clearRect(0, 0, width, height);
      container.dataset.animation = 'idle';
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
    },
  };
}
