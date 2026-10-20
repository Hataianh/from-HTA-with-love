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

// Each rose is drawn locally, so the garden also works without image services.
function roseSvg(hue = 338, seed = 0, hero = false) {
  let petals = '';
  for (let ring = 8; ring >= 0; ring--) {
    const radius = 5 + ring * 4.65;
    const count = 5 + Math.floor(ring / 2);
    for (let p = 0; p < count; p++) {
      const angle = p * 360 / count + ring * 31 + seed * 13;
      const light = 58 + ring * 2.45 + (p % 3) * 1.4;
      petals += `<path d="M ${-radius * .63} ${-radius * .32} C ${-radius * 1.1} ${-radius * 1.18}, ${radius * .72} ${-radius * 1.42}, ${radius * .77} ${-radius * .45} C ${radius * .6} ${-radius * .05}, ${-radius * .08} ${-radius * .01}, ${-radius * .63} ${-radius * .32}Z" transform="rotate(${angle})" fill="hsl(${hue} 57% ${light}%)" stroke="hsl(${hue} 50% ${light - 12}%)" stroke-width=".65"/>`;
    }
  }
  return `<svg viewBox="0 0 140 340" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="stem-${seed}-${hero}" x2="1" y2="0"><stop stop-color="#426e49"/><stop offset="1" stop-color="#7c9b5e"/></linearGradient></defs><path d="M70 338C60 255 83 168 70 79" fill="none" stroke="url(#stem-${seed}-${hero})" stroke-width="${hero ? 2.5 : 2}"/><path d="M70 200C31 199 27 170 27 170C54 166 71 181 70 200Z" fill="#5a8a61"/><path d="M71 242C105 239 116 210 116 210C86 207 72 225 71 242Z" fill="#67956a"/><path d="M68 194 36 177M75 237 107 215" stroke="#9eb286" fill="none" stroke-width=".8"/><path d="m70 102-14-22 15 9 14-10Z" fill="#4f8254"/><g transform="translate(70 59)">${petals}<path d="M-3-4C8-13 13 4 2 7C-8 10-11-3-3-4" fill="hsl(${hue} 56% 55%)" stroke="hsl(${hue} 50% 42%)" stroke-width="1"/></g></svg>`;
}
$('hero-art').innerHTML = roseSvg(339, 1, true);
let randomSeed = 42;
function random() { randomSeed = (randomSeed * 16807) % 2147483647; return (randomSeed - 1) / 2147483646; }
const hues = [337, 345, 354, 20, 42, 90, 155, 185, 290];
const garden = $('garden');
for (let i = 0; i < 64; i++) {
  const flower = document.createElement('div');
  flower.className = 'garden-flower';
  const row = i < 22 ? 0 : i < 44 ? 1 : 2;
  const left = ((i % 22) / 21) * 108 - 4 + (random() - .5) * 4;
  const height = 210 + random() * 145 + row * 18;
  flower.style.cssText = `--left:${left}%;--height:${height}px;--bottom:${-75 - row * 61 + random() * 50}px;--delay:${(Math.abs(left - 50) * .022 + random() * .65).toFixed(2)}s;--sway:${3 + random() * 3}s;--tilt:${(random() - .5) * 18}deg;z-index:${row + 1}`;
  flower.innerHTML = `<div class="flower-sway">${roseSvg(hues[Math.floor(random() * hues.length)], i + 2)}</div>`;
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
