import { renderPlay } from './football-scene.js?v=5';

const story = document.querySelector('[data-story]');
const canvas = story.querySelector('[data-pitch]');
const entryChapter = story.querySelector('#enter');
const fixturesChapter = story.querySelector('#follow');
const goalChapter = story.querySelector('#goal');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const ctx = canvas.getContext('2d');

// Cumulative playback time in milliseconds at maximum animation speed. The
// tackle and shot get longer than the strides between them.
const playbackTiming = [
  [0,0],
  [.30,240],
  [.48,555],
  [.708,755],
  [.78,1095],
  [.93,1400],
  [1,1500],
];
let width, height, top, beats;
let progress = 0, target = 0, frame = 0, last = 0;

function interpolate(value, points, inputColumn = 0) {
  const outputColumn = 1 - inputColumn;
  for (let i = 1; i < points.length; i++) {
    const start = points[i-1], end = points[i];
    if (value > end[inputColumn]) continue;
    const span = end[inputColumn] - start[inputColumn];
    if (!span) return end[outputColumn];
    const fraction = (value - start[inputColumn]) / span;
    return start[outputColumn] + fraction * (end[outputColumn] - start[outputColumn]);
  }
  return points.at(-1)[outputColumn];
}

function draw(time) {
  frame = 0;
  const dt = last ? Math.min(time - last, 34) : 16;
  last = time;
  const playing = interpolate(progress, playbackTiming);
  const requested = interpolate(target, playbackTiming);
  const remaining = requested - playing;
  const step = Math.min(dt, Math.abs(remaining) * (1 - Math.exp(-dt / 90)));
  progress = Math.abs(remaining) < .20
    ? target
    : interpolate(playing + Math.sign(remaining) * step, playbackTiming, 1);
  renderPlay(ctx, width, height, progress);
  if (progress !== target) frame = requestAnimationFrame(draw);
  else last = 0;
}

function position() {
  const distance = Math.max(0,scrollY-top);
  // Keep the dodge and goal aligned with the copy on different screen sizes.
  return interpolate(distance, beats);
}
function onScroll() {
  if (reduced.matches || !ctx) return;
  target = position();
  if (!frame && target !== progress) frame = requestAnimationFrame(draw);
}

function resize() {
  cancelAnimationFrame(frame);
  frame = last = 0;
  story.classList.toggle('live-pitch', Boolean(ctx) && !reduced.matches);
  if (!ctx || reduced.matches) return;
  const rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  const pixels = Math.min(devicePixelRatio || 1, 2);
  canvas.width = Math.round(width * pixels);
  canvas.height = Math.round(height * pixels);
  ctx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0);
  top = story.getBoundingClientRect().top + scrollY;
  const entry = entryChapter.offsetTop;
  const fixtures = fixturesChapter.offsetTop;
  const followSpan = goalChapter.offsetTop - fixtures;
  beats = [
    [0,0],
    [entry,.28],
    [entry+(entryChapter.offsetHeight-height)*.45,.43],
    [fixtures,.69],
    // Spend more scroll travel on the backswing and boot contact, then
    // pick up the pace again as the ball heads toward the keeper.
    [fixtures+followSpan*.055,.708],
    [fixtures+followSpan*.14,.725],
    [fixtures+followSpan*.34,.75],
    [fixtures+followSpan*.575,.778],
    [fixtures+followSpan*.69,.804],
    [goalChapter.offsetTop,.92],
    [story.offsetHeight-height,1],
  ];
  progress = target = position();
  renderPlay(ctx, width, height, progress);
}

resize();
addEventListener('scroll', onScroll, { passive: true });
addEventListener('resize', resize);
addEventListener('pageshow', resize);
reduced.addEventListener('change', resize);
document.fonts.ready.then(resize);
