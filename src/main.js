import '@fontsource/be-vietnam-pro/latin-300.css';
import '@fontsource/be-vietnam-pro/vietnamese-300.css';
import '@fontsource/be-vietnam-pro/latin-400.css';
import '@fontsource/be-vietnam-pro/vietnamese-400.css';
import '@fontsource/be-vietnam-pro/latin-500.css';
import '@fontsource/be-vietnam-pro/vietnamese-500.css';
import '@fontsource/be-vietnam-pro/latin-600.css';
import '@fontsource/be-vietnam-pro/vietnamese-600.css';
import '@fontsource/cormorant-garamond/latin-400.css';
import '@fontsource/cormorant-garamond/latin-400-italic.css';
import '@fontsource/cormorant-garamond/vietnamese-400.css';
import '@fontsource/cormorant-garamond/vietnamese-400-italic.css';
import '@fontsource/cormorant-garamond/latin-500.css';
import '@fontsource/cormorant-garamond/latin-500-italic.css';
import '@fontsource/cormorant-garamond/vietnamese-500.css';
import '@fontsource/cormorant-garamond/vietnamese-500-italic.css';
import '@fontsource/cormorant-garamond/latin-600.css';
import '@fontsource/cormorant-garamond/vietnamese-600.css';
import './style.css';
import { createGarden } from './garden.js';

const $ = (id) => document.getElementById(id);
const motionQuery = matchMedia('(prefers-reduced-motion: reduce)');
let motionChoice = null;
try {
  const saved = localStorage.getItem('garden-motion');
  if (saved === 'on' || saved === 'off') motionChoice = saved;
} catch {}
let reduceMotion = motionChoice === 'off' || (motionChoice !== 'on' && motionQuery.matches);
document.documentElement.dataset.motion = reduceMotion ? 'off' : 'on';
let bloomed = false;
let bloomTimer;

// Cache each blossom as an image shared by the whole garden. Animating HTML
// image layers avoids repainting thousands of SVG petal paths on every frame.
const blossomImages = new Map();
function getBlossomUrl(hue = 342, variant = 0) {
  const id = `rose-${hue}-${variant}`;
  const hueColor = (light, saturation = 61) => `hsl(${hue} ${saturation}% ${light}%)`;
  if (!blossomImages.has(id)) {
    let definitions = '';
    let petals = '';
    const radii = [44, 38.5, 33.2, 28.2, 23.6, 19.2, 15.1, 11.3, 7.9, 5.1];
    radii.forEach((radius, layer) => {
      const count = layer < 4 ? 5 : 4;
      const light = 76 - layer * 1.65;
      definitions += `<linearGradient id="${id}-p${layer}" x1=".35" y1="0" x2=".65" y2="1"><stop stop-color="${hueColor(light + 12)}"/><stop offset=".16" stop-color="${hueColor(light + 4)}"/><stop offset=".46" stop-color="${hueColor(light - 9)}"/><stop offset="1" stop-color="${hueColor(light - 17)}"/></linearGradient>`;
      for (let p = 0; p < count; p++) {
        const rotation = p * 360 / count + layer * 41 + variant * 17;
        const skew = Math.sin(variant * 4.1 + p * 1.8 + layer) * 3;
        const edge = 'M-.79-.35C-.87-.5-.69-.69-.58-.77C-.44-.91-.25-.88-.09-.98C.07-1.06.27-.94.41-.85C.6-.78.65-.61.76-.46C.9-.24.7-.06.5.02';
        const petal = `${edge}C.13.19-.2.2-.44.11C-.62.03-.71-.13-.79-.35Z`;
        const rim = 'M-.79-.35C-.87-.5-.69-.69-.58-.77C-.44-.91-.25-.88-.09-.98C.07-1.06.27-.94.41-.85C.6-.78.65-.61.76-.46';
        petals += `<g transform="rotate(${rotation + skew}) scale(${radius})"><path d="${petal}" fill="url(#${id}-p${layer})" stroke="${hueColor(light - 15)}" stroke-opacity=".32" stroke-width=".014"/><path d="${rim}" fill="none" stroke="${hueColor(light + 13, 68)}" stroke-opacity=".82" stroke-width=".024" stroke-linecap="round"/></g>`;
      }
    });
    const blossom = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-48 -48 96 96"><defs>${definitions}</defs>${petals}<path d="M-2-4C5-7 9 0 4 4C-2 9-9 1-3-3C1-5 5-1 2 2" fill="none" stroke="${hueColor(84)}" stroke-width=".75" stroke-linecap="round"/></svg>`;
    blossomImages.set(id, URL.createObjectURL(new Blob([blossom], { type: 'image/svg+xml' })));
  }
  return blossomImages.get(id);
}
function roseArt(hue = 342, seed = 0, hero = false) {
  const hueColor = (light, saturation = 61) => `hsl(${hue} ${saturation}% ${light}%)`;
  const blossomUrl = getBlossomUrl(hue, seed % 2);
  const bend = Math.sin(seed * 1.7) * 8;
  const stem = `<path d="M${70 + bend} 340C${56 + bend} 266 80 169 70 82" fill="none" stroke="url(#rose-stem)" stroke-width="${hero ? 1.5 : 1.15}"/><path d="M72 153C51 154 43 142 40 132C58 132 69 141 72 153Z" fill="url(#rose-leaf)"/><path d="M72 198C93 196 102 181 104 175C88 175 76 185 72 198Z" fill="url(#rose-leaf)"/><path d="m70 151-22-14m26 58 23-16" stroke="#8aaa80" stroke-opacity=".6" stroke-width=".6"/>`;
  const bud = seed > 1 && seed % 15 === 0;
  const head = bud ? `<g transform="translate(70 61) rotate(-12)"><path d="M0 23C-23 5-22-17-7-31C-8-9 8-10 0 23Z" fill="${hueColor(76)}"/><path d="M0 23C-8 2-1-15 10-26C28-10 19 13 0 23Z" fill="${hueColor(67)}"/><path d="M0 25C-16 13-16 3-17-5C-8 7-4 11 0 13C6 5 15 0 20-9C20 9 9 21 0 25Z" fill="url(#rose-leaf)"/></g>` : '<path d="m60 92 11 18 12-18" fill="#467e54"/>';
  const blossom = bud ? '' : `<img class="rose-petals" src="${blossomUrl}" alt="" draggable="false"/>`;
  return `<span class="rose-plant"><svg class="rose-vector" viewBox="0 0 140 340" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${stem}${head}</svg>${blossom}</span>`;
}
$('hero-art').innerHTML = roseArt(342, 1, true);
let randomSeed = 42;
function random() { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; }
const garden = createGarden($('garden'), getBlossomUrl, reduceMotion);
const motionButton = document.createElement('button');
motionButton.id = 'motion-toggle';
motionButton.type = 'button';
motionButton.className = 'icon-button motion-toggle';
motionButton.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M3 8h11c5 0 5-6 1-6-2 0-3 1-3 2M3 12h15c5 0 5 7 1 7-2 0-3-1-3-2M3 16h6c4 0 4 5 1 5"/><path class="motion-slash" d="m4 3 16 18"/></svg>';
$('sound').before(motionButton);
function updateMotionControl() {
  const label = reduceMotion ? 'Bật hoa rung rinh' : 'Tắt hoa rung rinh';
  motionButton.setAttribute('aria-label', label);
  motionButton.setAttribute('title', label);
  motionButton.setAttribute('aria-pressed', String(!reduceMotion));
}
function applyMotionPreference(next) {
  reduceMotion = next;
  document.documentElement.dataset.motion = next ? 'off' : 'on';
  garden.setReducedMotion(next);
  if (bloomed && next) {
    clearTimeout(bloomTimer);
    $('experience').classList.add('settled');
  }
  updateMotionControl();
}
motionButton.addEventListener('click', () => {
  motionChoice = reduceMotion ? 'on' : 'off';
  try { localStorage.setItem('garden-motion', motionChoice); } catch {}
  applyMotionPreference(motionChoice === 'off');
});
const onSystemMotionChange = () => {
  if (motionChoice === null) applyMotionPreference(motionQuery.matches);
};
if (motionQuery.addEventListener) motionQuery.addEventListener('change', onSystemMotionChange);
else motionQuery.addListener(onSystemMotionChange);
updateMotionControl();

const definitions = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
definitions.setAttribute('class', 'rose-definitions');
definitions.setAttribute('aria-hidden', 'true');
definitions.setAttribute('width', '0');
definitions.setAttribute('height', '0');
definitions.innerHTML = `<defs><linearGradient id="rose-stem"><stop stop-color="#507249"/><stop offset=".6" stop-color="#73936b"/><stop offset="1" stop-color="#416942"/></linearGradient><linearGradient id="rose-leaf" x2="1" y2="1"><stop stop-color="#76a46e"/><stop offset=".5" stop-color="#2b7a4c"/><stop offset="1" stop-color="#21643e"/></linearGradient></defs>`;
$('experience').prepend(definitions);
for (let i = 0; i < 18; i++) {
  const petal = document.createElement('i');
  petal.style.cssText = `--x:${random() * 100}%;--duration:${9 + random() * 12}s;--delay:${random() * -20}s;--size:${5 + random() * 7}px;--drift:${random() * 220 - 110}px`;
  $('petals').appendChild(petal);
}
async function bloom() {
  if (bloomed) return;
  bloomed = true;
  await garden.ready;
  $('experience').classList.add('bloomed');
  garden.bloom();
  $('hero-flower').disabled = true;
  $('bloom').disabled = true;
  $('replay').hidden = false;
  bloomTimer = setTimeout(() => { $('experience').classList.add('settled'); }, reduceMotion ? 0 : 3300);
}
$('bloom').addEventListener('click', bloom);
$('hero-flower').addEventListener('click', bloom);
$('replay').addEventListener('click', () => {
  clearTimeout(bloomTimer);
  garden.reset();
  $('experience').classList.remove('bloomed', 'settled');
  $('hero-flower').disabled = false;
  $('bloom').disabled = false;
  $('replay').hidden = true;
  bloomed = false;
});
$('open-letter').addEventListener('click', () => { garden.pause(); $('letter').showModal(); });
$('letter').addEventListener('close', () => garden.resume());
$('close-letter').addEventListener('click', () => $('letter').close());
$('letter').addEventListener('click', (e) => { if (e.target === $('letter')) { const r = $('letter').getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) $('letter').close(); } });

let audioContext, masterGain, notesTimer;
let soundOn = false;
const melody = [523.25, 659.25, 783.99, 987.77, 783.99, 659.25, 587.33, 698.46, 880, 1046.5, 880, 698.46];
let noteIndex = 0;
function playNote() {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = melody[noteIndex++ % melody.length];
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(.12, now + .03);
  gain.gain.exponentialRampToValueAtTime(.001, now + 2.8);
  oscillator.connect(gain); gain.connect(masterGain);
  oscillator.start(now); oscillator.stop(now + 3);
}
$('sound').addEventListener('click', async () => {
  if (!audioContext) {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) { $('sound').setAttribute('aria-label', 'Trình duyệt chưa hỗ trợ âm thanh'); return; }
    audioContext = new Audio(); masterGain = audioContext.createGain(); masterGain.connect(audioContext.destination);
  }
  await audioContext.resume();
  soundOn = !soundOn;
  masterGain.gain.setTargetAtTime(soundOn ? .35 : 0, audioContext.currentTime, .15);
  clearInterval(notesTimer);
  if (soundOn) { playNote(); notesTimer = setInterval(playNote, 950); }
  $('sound').setAttribute('aria-pressed', String(soundOn));
  $('sound').setAttribute('aria-label', soundOn ? 'Tắt âm thanh' : 'Bật âm thanh');
});
