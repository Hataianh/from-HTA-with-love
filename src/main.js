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

const $ = (id) => document.getElementById(id);
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let bloomed = false;
let bloomTimer;

// The transparent botanical artwork is bundled locally, with color applied only
// to the blossom so each plant keeps its natural green stem and leaves.
const roseImage = new URL('./assets/garden-rose.webp', import.meta.url).href;
function roseArt(tone = 0, seed = 0) {
  const mirrored = seed % 3 === 0 ? -1 : 1;
  return `<span class="rose-plant" style="--rose-tone:${tone}deg;--rose-mirror:${mirrored}"><img class="rose-base" src="${roseImage}" alt="" draggable="false"/><img class="rose-tint" src="${roseImage}" alt="" draggable="false"/></span>`;
}
$('hero-art').innerHTML = roseArt(0, 1);
let randomSeed = 42;
function random() { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; }
const roseTones = [-9, -4, 0, 0, 7, 15, 23, 32];
const garden = $('garden');
for (let i = 0; i < 64; i++) {
  const flower = document.createElement('div');
  flower.className = `garden-flower ${i < 22 ? 'garden-back' : 'garden-front'}`;
  const row = i < 22 ? 0 : i < 44 ? 1 : 2;
  const left = ((i % 22) / 21) * 108 - 4 + (random() - .5) * 4;
  const height = 210 + random() * 145 + row * 18;
  flower.style.cssText = `--left:${left}%;--height:${height}px;--bottom:${-75 - row * 61 + random() * 50}px;--delay:${(Math.abs(left - 50) * .022 + random() * .65).toFixed(2)}s;--sway:${3 + random() * 3}s;--tilt:${(random() - .5) * 18}deg;z-index:${row + 1}`;
  flower.innerHTML = `<div class="flower-sway">${roseArt(roseTones[Math.floor(random() * roseTones.length)], i + 2)}</div>`;
  garden.appendChild(flower);
}
for (let i = 0; i < 18; i++) {
  const petal = document.createElement('i');
  petal.style.cssText = `--x:${random() * 100}%;--duration:${9 + random() * 12}s;--delay:${random() * -20}s;--size:${5 + random() * 7}px;--drift:${random() * 220 - 110}px`;
  $('petals').appendChild(petal);
}
function bloom() {
  if (bloomed) return;
  bloomed = true;
  $('experience').classList.add('bloomed');
  $('hero-flower').disabled = true;
  $('bloom').disabled = true;
  $('replay').hidden = false;
  bloomTimer = setTimeout(() => { $('experience').classList.add('settled'); }, reduceMotion ? 0 : 2500);
}
$('bloom').addEventListener('click', bloom);
$('hero-flower').addEventListener('click', bloom);
$('replay').addEventListener('click', () => {
  clearTimeout(bloomTimer);
  $('experience').classList.remove('bloomed', 'settled');
  $('hero-flower').disabled = false;
  $('bloom').disabled = false;
  $('replay').hidden = true;
  bloomed = false;
});
$('open-letter').addEventListener('click', () => $('letter').showModal());
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
