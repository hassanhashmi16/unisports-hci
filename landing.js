import { renderPlay } from './football-scene.js';

const story = document.querySelector('[data-story]');
const canvas = story.querySelector('[data-pitch]');
const entryChapter = story.querySelector('#enter');
const fixturesChapter = story.querySelector('#follow');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const ctx = canvas.getContext('2d');
let width, height, top, beats;
let progress = 0, target = 0, frame = 0, last = 0;

function draw(time) {
  frame = 0;
  const dt = last ? Math.min(time - last, 64) : 16;
  last = time;
  progress += (target - progress) * (1 - Math.exp(-dt / 90));
  if (Math.abs(progress - target) < .00013) progress = target;
  renderPlay(ctx, width, height, progress);
  if (progress !== target) frame = requestAnimationFrame(draw);
  else last = 0;
}

function position() {
  const distance = Math.max(0,scrollY-top);
  // Keep the dodge and goal aligned with the copy on different screen sizes.
  for (let i = 1; i < beats.length; i++) {
    const [end,to] = beats[i];
    if (distance <= end) {
      const [start,from] = beats[i-1];
      return from+(to-from)*(distance-start)/Math.max(1,end-start);
    }
  }
  return 1;
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
  const goalScroll = (fixturesChapter.offsetHeight-height)*.71;
  beats = [
    [0,0],
    [entry,.28],
    [entry+(entryChapter.offsetHeight-height)*.45,.43],
    [fixtures,.69],
    // Spend more scroll travel on the backswing and boot contact, then
    // pick up the pace again as the ball heads toward the keeper.
    [fixtures+goalScroll*.055,.708],
    [fixtures+goalScroll*.14,.725],
    [fixtures+goalScroll*.34,.75],
    [fixtures+goalScroll*.575,.778],
    [fixtures+goalScroll*.69,.804],
    [fixtures+goalScroll,.93],
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
