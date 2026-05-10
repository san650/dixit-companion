/* =====================================================================
   Dixit Companion — app logic.
   ===================================================================== */

const $ = (sel) => document.querySelector(sel);

const els = {
  sheet:        $('#sheet'),
  stage:        document.querySelector('.stage'),
  phrase:       $('#phrase'),
  activity:     $('#activity'),
  region:       $('#region'),
  accent:       $('#accent'),
  labelKey:     $('#labelKey'),
  counter:      $('#counter'),
  genLabel:     $('#genLabel'),
  genTag:       $('#genTag'),
  dateStamp:    $('#dateStamp'),
  netDot:       $('#netDot'),
  netLabel:     $('#netLabel'),
  btn:          $('#generateBtn'),
  restartBtn:   $('#restartBtn'),
  logBtn:       $('#logBtn'),
  logCount:     $('#logCount'),
  historyStack: $('#historyStack'),
  logModal:     $('#logModal'),
  modalList:    $('#modalList'),
  modalCount:   $('#modalCount'),
  confirmModal: $('#confirmModal'),
};

/* Per-generation accent colors — gold, coral, plum (Dixit nocturne palette) */
const ACCENT_COLORS = [
  { name: 'gold',  value: '#D4AF6F' },
  { name: 'coral', value: '#D97862' },
  { name: 'plum',  value: '#B697C0' },
];

/* ---------- Dixit ornaments (built via DOM) ------------------------- */

const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(name, attrs) {
  const node = document.createElementNS(SVG_NS, name);
  for (const k in attrs) node.setAttribute(k, attrs[k]);
  return node;
}
function svgRoot(...children) {
  const root = svgEl('svg', { viewBox: '0 0 100 100' });
  children.forEach((c) => root.appendChild(c));
  return root;
}

/* Symbol vocabulary borrowed from Dixit cards: moon, star, key, eye,
   door, leaf, sparkle, sun, mountains, balloon, spiral, hand,
   hourglass, tree, flame, crown, blossom. */
const SHAPES = [
  // Crescent moon
  () => svgRoot(svgEl('path', {
    d: 'M62 14 a36 36 0 1 0 0 72 a26 26 0 1 1 0 -72 Z',
    fill: 'currentColor',
  })),
  // Five-point star
  () => svgRoot(svgEl('path', {
    d: 'M50 8 L60.5 36 L90 36 L65.5 54 L75 84 L50 66 L25 84 L34.5 54 L10 36 L39.5 36 Z',
    fill: 'currentColor',
  })),
  // Old key (ring + shaft + teeth)
  () => svgRoot(
    svgEl('circle', { cx: 30, cy: 30, r: 16, fill: 'none', stroke: 'currentColor', 'stroke-width': 4.5 }),
    svgEl('circle', { cx: 30, cy: 30, r: 5,  fill: 'currentColor' }),
    svgEl('path',   { d: 'M40 40 L80 80', stroke: 'currentColor', 'stroke-width': 4.5, 'stroke-linecap': 'round' }),
    svgEl('path',   { d: 'M70 64 L80 64 M58 78 L70 78', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round' }),
  ),
  // Open eye (almond + iris + pupil)
  () => svgRoot(
    svgEl('path', {
      d: 'M8 50 Q 50 14 92 50 Q 50 86 8 50 Z',
      fill: 'none', stroke: 'currentColor', 'stroke-width': 4,
    }),
    svgEl('circle', { cx: 50, cy: 50, r: 14, fill: 'currentColor' }),
    svgEl('circle', { cx: 46, cy: 46, r: 3.5, fill: '#0F1B33' }),
  ),
  // Arched door (with knob)
  () => svgRoot(
    svgEl('path', {
      d: 'M22 90 L22 38 Q 22 12 50 12 Q 78 12 78 38 L78 90 Z',
      fill: 'none', stroke: 'currentColor', 'stroke-width': 4, 'stroke-linejoin': 'miter',
    }),
    svgEl('circle', { cx: 65, cy: 56, r: 2.4, fill: 'currentColor' }),
    svgEl('path', { d: 'M50 12 L50 90', stroke: 'currentColor', 'stroke-width': 1.2, opacity: 0.5 }),
  ),
  // Leaf with central vein
  () => svgRoot(
    svgEl('path', {
      d: 'M50 8 C 80 28 80 72 50 92 C 20 72 20 28 50 8 Z',
      fill: 'currentColor',
    }),
    svgEl('path', { d: 'M50 8 L50 92', stroke: '#0F1B33', 'stroke-width': 1.6, opacity: 0.55 }),
  ),
  // Four-point sparkle
  () => svgRoot(svgEl('path', {
    d: 'M50 8 Q 54 46 92 50 Q 54 54 50 92 Q 46 54 8 50 Q 46 46 50 8 Z',
    fill: 'currentColor',
  })),
  // Sun with eight rays
  () => {
    const root = svgRoot(svgEl('circle', { cx: 50, cy: 50, r: 16, fill: 'currentColor' }));
    [
      'M50 6 L50 22',  'M50 78 L50 94',
      'M6 50 L22 50',  'M78 50 L94 50',
      'M18 18 L29 29', 'M71 71 L82 82',
      'M18 82 L29 71', 'M71 29 L82 18',
    ].forEach((d) => root.appendChild(svgEl('path', {
      d, stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round',
    })));
    return root;
  },
  // Triple mountain peaks
  () => svgRoot(
    svgEl('path', {
      d: 'M6 84 L26 36 L40 60 L56 18 L74 60 L94 84 Z',
      fill: 'currentColor',
    }),
    svgEl('path', {
      d: 'M22 50 L26 36 L30 50 Z M52 38 L56 18 L60 38 Z M70 50 L74 60 L78 50 Z',
      fill: '#0F1B33', opacity: 0.35,
    }),
  ),
  // Hot-air balloon
  () => svgRoot(
    svgEl('path', {
      d: 'M50 8 C 28 8 16 28 22 50 L32 70 L68 70 L78 50 C 84 28 72 8 50 8 Z',
      fill: 'currentColor',
    }),
    svgEl('path', {
      d: 'M50 8 L50 70 M30 12 C 30 40 36 60 40 70 M70 12 C 70 40 64 60 60 70',
      stroke: '#0F1B33', 'stroke-width': 1.4, fill: 'none', opacity: 0.45,
    }),
    svgEl('rect', { x: 40, y: 78, width: 20, height: 12, fill: 'none', stroke: 'currentColor', 'stroke-width': 3 }),
    svgEl('path', { d: 'M34 70 L40 78 M66 70 L60 78', stroke: 'currentColor', 'stroke-width': 2, 'stroke-linecap': 'round' }),
  ),
  // Cosmic spiral
  () => svgRoot(svgEl('path', {
    d: 'M50 50 C 53 50 56 48 56 44 C 56 38 50 36 44 40 C 34 46 34 60 44 66 C 58 74 74 60 72 44 C 70 22 46 18 30 30 C 10 46 14 76 38 84',
    stroke: 'currentColor', 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
  })),
  // Open hand
  () => svgRoot(
    svgEl('path', {
      d: 'M28 92 L28 56 Q 28 50 33 50 L36 50 L36 32 Q 36 27 41 27 Q 46 27 46 32 L46 50 L48 50 L48 22 Q 48 17 53 17 Q 58 17 58 22 L58 50 L60 50 L60 26 Q 60 21 65 21 Q 70 21 70 26 L70 50 L72 50 L72 38 Q 72 33 77 33 Q 82 33 82 38 L82 60 Q 82 78 70 92 Z',
      fill: 'currentColor',
    }),
    svgEl('path', {
      d: 'M44 64 L66 64 M44 72 L62 72',
      stroke: '#0F1B33', 'stroke-width': 1.2, opacity: 0.4, 'stroke-linecap': 'round',
    }),
  ),
  // Hourglass
  () => svgRoot(
    svgEl('path', {
      d: 'M22 12 L78 12 L78 16 L54 50 L78 84 L78 88 L22 88 L22 84 L46 50 L22 16 Z',
      fill: 'currentColor',
    }),
    svgEl('path', {
      d: 'M50 38 L50 62',
      stroke: '#0F1B33', 'stroke-width': 1.6, opacity: 0.55,
    }),
    svgEl('circle', { cx: 50, cy: 64, r: 1.8, fill: '#0F1B33', opacity: 0.55 }),
  ),
  // Stylized pine tree
  () => svgRoot(
    svgEl('path', {
      d: 'M50 8 L34 32 L42 32 L26 54 L36 54 L18 78 L82 78 L64 54 L74 54 L58 32 L66 32 Z',
      fill: 'currentColor',
    }),
    svgEl('rect', { x: 46, y: 78, width: 8, height: 14, fill: 'currentColor' }),
  ),
  // Flame above wick
  () => svgRoot(
    svgEl('path', {
      d: 'M50 8 C 44 22 36 28 36 44 C 36 58 44 64 50 76 C 56 64 64 58 64 44 C 64 28 56 22 50 8 Z',
      fill: 'currentColor',
    }),
    svgEl('path', {
      d: 'M50 28 C 47 36 44 40 44 50 C 44 58 50 60 50 66 C 50 60 56 58 56 50 C 56 40 53 36 50 28 Z',
      fill: '#0F1B33', opacity: 0.35,
    }),
    svgEl('path', { d: 'M50 76 L50 92', stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' }),
  ),
  // Crown with three jewels
  () => svgRoot(
    svgEl('path', {
      d: 'M12 80 L12 36 L28 52 L40 24 L50 50 L60 24 L72 52 L88 36 L88 80 Z',
      fill: 'currentColor',
    }),
    svgEl('rect', { x: 12, y: 80, width: 76, height: 6, fill: 'currentColor' }),
    svgEl('circle', { cx: 40, cy: 24, r: 3.2, fill: '#0F1B33', opacity: 0.55 }),
    svgEl('circle', { cx: 60, cy: 24, r: 3.2, fill: '#0F1B33', opacity: 0.55 }),
    svgEl('circle', { cx: 50, cy: 50, r: 3.2, fill: '#0F1B33', opacity: 0.55 }),
  ),
  // Blossom (six-petal flower)
  () => svgRoot(
    svgEl('circle', { cx: 50, cy: 22, r: 12, fill: 'currentColor' }),
    svgEl('circle', { cx: 50, cy: 78, r: 12, fill: 'currentColor' }),
    svgEl('circle', { cx: 26, cy: 36, r: 12, fill: 'currentColor' }),
    svgEl('circle', { cx: 74, cy: 36, r: 12, fill: 'currentColor' }),
    svgEl('circle', { cx: 26, cy: 64, r: 12, fill: 'currentColor' }),
    svgEl('circle', { cx: 74, cy: 64, r: 12, fill: 'currentColor' }),
    svgEl('circle', { cx: 50, cy: 50, r: 9, fill: '#0F1B33', opacity: 0.55 }),
  ),
];

const REPEAT_WINDOW = 5;
const VISIBLE_HISTORY = 5;
const STORAGE_KEY = 'dixit-companion.game';

const state = {
  data: null,
  session: 'idle',          // 'idle' | 'active'
  current: null,            // { activity, region, seq }
  history: [],              // newest first
  seq: 0,
};

/* ---------- Persistence (survive refresh) -------------------------- */

function persist() {
  try {
    if (state.session === 'idle') {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      v: 1,
      session: state.session,
      current: state.current,
      history: state.history,
      seq: state.seq,
    }));
  } catch (err) { /* private mode / quota — ignore */ }
}

function hydrate() {
  let raw;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch { return; }
  if (!raw) return;
  try {
    const saved = JSON.parse(raw);
    if (!saved || saved.session !== 'active' || !saved.current) return;
    state.session = 'active';
    state.current = saved.current;
    state.history = Array.isArray(saved.history) ? saved.history : [];
    state.seq = Number.isFinite(saved.seq) ? saved.seq : (saved.current.seq || 0);
  } catch {
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}

/* ---------- Helpers -------------------------------------------------- */

function pad3(n) { return String(n).padStart(3, '0'); }
function pad2(n) { return String(n).padStart(2, '0'); }
function pairKey(a, r) { return `${a}|${r}`; }

function todayStamp() {
  // Nocturne stamp: lowercase Spanish month abbreviation
  const d = new Date();
  const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  return `${d.getDate()} ${months[d.getMonth()]} · ${d.getFullYear()}`;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

/* "del mundo" is always available for every activity, with a small bias
   so it lands ~10% more often than any other region in the pool. */
const GENERAL_REGION = 'del mundo';
const GENERAL_WEIGHT = 1.1;
const REGULAR_WEIGHT = 1.0;

function regionsFor(activity) {
  return Array.from(new Set([...activity.regions, GENERAL_REGION]));
}

/* Weighted random pick: regions get weight 1.0, "del mundo" gets 1.1. */
function pickRegion(regions) {
  const weights = regions.map((r) => (r === GENERAL_REGION ? GENERAL_WEIGHT : REGULAR_WEIGHT));
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < regions.length; i++) {
    r -= weights[i];
    if (r < 0) return regions[i];
  }
  return regions[regions.length - 1];
}

function totalCombinations() {
  return state.data.activities.reduce(
    (sum, a) => sum + regionsFor(a).length,
    0,
  );
}

function pickPair() {
  const { activities } = state.data;

  const recent = new Set();
  if (state.current) recent.add(pairKey(state.current.activity, state.current.region));
  state.history.slice(0, REPEAT_WINDOW - 1).forEach((h) =>
    recent.add(pairKey(h.activity, h.region))
  );

  const cap = recent.size >= totalCombinations() ? 0 : recent.size;

  for (let i = 0; i < 200; i++) {
    const activity = rand(activities);
    const region = pickRegion(regionsFor(activity));
    if (cap === 0 || !recent.has(pairKey(activity.name, region))) {
      return { activity: activity.name, region };
    }
  }
  const activity = rand(activities);
  const region = pickRegion(regionsFor(activity));
  return { activity: activity.name, region };
}

function setLabelKey(left, right) {
  const sep = document.createElement('i');
  sep.textContent = '·';
  els.labelKey.replaceChildren(
    document.createTextNode(left + ' '),
    sep,
    document.createTextNode(' ' + right),
  );
}

function regionIsGeneral(region) {
  // Accept legacy 'General' from previously persisted sessions.
  return region === GENERAL_REGION || region === 'General';
}
function regionDisplay(region) {
  return regionIsGeneral(region) ? GENERAL_REGION : `de ${region}`;
}

function buildPhraseSpans(entry) {
  const a = document.createElement('span');
  a.className = 'h-activity';
  a.textContent = entry.activity;

  const r = document.createElement('span');
  r.className = 'h-region';
  r.textContent = regionDisplay(entry.region);
  if (regionIsGeneral(entry.region)) r.classList.add('is-general');

  const wrap = document.createElement('span');
  wrap.className = 'h-phrase';
  wrap.append(a, document.createTextNode(' '), r);
  return wrap;
}

/* ---------- Render: current category -------------------------------- */

function renderCurrent() {
  const cur = state.current;

  els.stage.classList.remove('cycle');
  void els.stage.offsetWidth;

  if (!cur) {
    els.activity.textContent = 'Aguarda';
    els.region.textContent = 'pulsa empezar';
    els.region.classList.remove('is-general');
    els.accent.replaceChildren();
    setLabelKey('Sesión', 'en pausa');
    return;
  }

  els.activity.textContent = cur.activity;
  els.region.textContent = regionDisplay(cur.region);
  els.region.classList.toggle('is-general', regionIsGeneral(cur.region));
  setLabelKey('actividad', 'región');

  // Accent: fresh ornament + color
  const color = rand(ACCENT_COLORS);
  els.accent.replaceChildren(rand(SHAPES)());
  document.documentElement.style.setProperty('--accent', color.value);

  // Counter
  els.counter.classList.remove('tick');
  void els.counter.offsetWidth;
  els.counter.textContent = pad3(cur.seq);
  els.counter.classList.add('tick');
  els.genTag.textContent = `№ ${pad3(cur.seq)}`;
}

/* ---------- Render: receding history stack -------------------------- */

function renderHistoryStack({ animateNew = false } = {}) {
  const list = els.historyStack;
  list.replaceChildren();

  const visible = state.history.slice(0, VISIBLE_HISTORY);

  visible.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.dataset.depth = String(idx);
    if (animateNew && idx === 0) li.classList.add('entering');

    const num = document.createElement('span');
    num.className = 'h-num';
    num.textContent = pad2(entry.seq);

    li.append(num, buildPhraseSpans(entry));
    list.appendChild(li);
  });
}

/* ---------- Render: action area state ------------------------------ */

function renderSession() {
  els.sheet.dataset.session = state.session;
  if (state.session === 'idle') {
    els.genLabel.textContent = 'Empezar partida';
    els.restartBtn.hidden = true;
    els.logBtn.hidden = true;
  } else {
    els.genLabel.textContent = 'Otra categoría';
    els.restartBtn.hidden = false;
    els.logBtn.hidden = false;
    const total = state.history.length + (state.current ? 1 : 0);
    els.logCount.textContent = String(total);
  }
}

/* ---------- Render: full session log dialog ------------------------- */

function renderModal() {
  const list = els.modalList;
  list.replaceChildren();

  const entries = [];
  if (state.current) entries.push({ ...state.current, isCurrent: true });
  state.history.forEach((h) => entries.push({ ...h, isCurrent: false }));

  els.modalCount.textContent = pad2(entries.length);

  entries.forEach((entry, idx) => {
    const li = document.createElement('li');
    li.className = 'modal-item';
    if (entry.isCurrent) li.classList.add('is-current');
    li.style.animationDelay = `${Math.min(idx * 28, 420)}ms`;

    const num = document.createElement('span');
    num.className = 'm-num';
    num.textContent = pad3(entry.seq);

    const phrase = document.createElement('span');
    phrase.className = 'm-phrase';
    const a = document.createElement('span');
    a.className = 'm-activity';
    a.textContent = entry.activity;
    const r = document.createElement('span');
    r.className = 'm-region';
    r.textContent = regionDisplay(entry.region);
    if (regionIsGeneral(entry.region)) r.classList.add('is-general');
    phrase.append(a, document.createTextNode(' '), r);

    const tag = document.createElement('span');
    tag.className = 'm-tag';
    tag.textContent = entry.isCurrent ? 'actual' : `№ ${pad3(entry.seq)}`;

    li.append(num, phrase, tag);
    list.appendChild(li);
  });
}

/* ---------- Actions -------------------------------------------------- */

function generate() {
  if (!state.data) return;

  if (state.current) state.history.unshift(state.current);

  const pair = pickPair();
  state.seq += 1;
  state.current = { ...pair, seq: state.seq };
  state.session = 'active';

  renderSession();
  renderHistoryStack({ animateNew: true });
  renderCurrent();
  // run the stage cycle after render so the animations fire
  void els.stage.offsetWidth;
  els.stage.classList.add('cycle');

  persist();
}

function clearGame() {
  state.session = 'idle';
  state.current = null;
  state.history = [];
  state.seq = 0;

  renderSession();
  renderCurrent();
  renderHistoryStack();
  document.documentElement.style.setProperty('--accent', '#D4AF6F');
  els.counter.textContent = pad3(0);
  els.genTag.textContent = `№ ${pad3(0)}`;

  persist();
}

function askRestart() {
  // Idle game → nothing to confirm
  if (state.session === 'idle') return;
  if (typeof els.confirmModal.showModal === 'function') {
    els.confirmModal.showModal();
  } else {
    // Fallback for browsers without <dialog>
    if (window.confirm('¿Terminar la partida? Se perderán las categorías generadas.')) {
      clearGame();
    }
  }
}

function openLog() {
  renderModal();
  if (typeof els.logModal.showModal === 'function') {
    els.logModal.showModal();
  } else {
    els.logModal.setAttribute('open', '');
  }
}

function closeLog() {
  if (els.logModal.open) els.logModal.close();
  else els.logModal.removeAttribute('open');
}

/* ---------- Splash overlay -----------------------------------------
   Shown until boot() resolves. Honors a minimum display time so the
   curtain doesn't flash on a warm cache, and a hard fallback so a
   stalled boot can never strand the user behind it. */

const splashEl   = document.getElementById('splash');
const splashStart = performance.now();
const SPLASH_MIN_MS = 700;

function hideSplash() {
  if (!splashEl || splashEl.dataset.gone === '1') return;
  splashEl.dataset.gone = '1';
  const wait = Math.max(0, SPLASH_MIN_MS - (performance.now() - splashStart));
  setTimeout(() => {
    splashEl.classList.add('is-leaving');
    const finish = () => splashEl.remove();
    splashEl.addEventListener('transitionend', finish, { once: true });
    // belt-and-braces: in case transitionend never fires
    setTimeout(finish, 900);
  }, wait);
}

// Hard fallback: never let the splash linger past ~6s, regardless of boot state.
setTimeout(hideSplash, 6000);

/* ---------- Network/offline status ---------------------------------- */

function paintNetStatus() {
  const online = navigator.onLine;
  els.netDot.classList.toggle('offline', !online);
  els.netLabel.textContent = online ? 'en línea' : 'sin conexión';
}

/* ---------- Boot ----------------------------------------------------- */

async function loadData() {
  try {
    const res = await fetch('./data.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch (err) {
    if ('caches' in window) {
      const cached = await caches.match('./data.json');
      if (cached) return cached.json();
    }
    throw err;
  }
}

async function boot() {
  els.dateStamp.textContent = todayStamp();
  els.counter.textContent = pad3(0);
  els.genTag.textContent = `№ ${pad3(0)}`;

  paintNetStatus();
  window.addEventListener('online',  paintNetStatus);
  window.addEventListener('offline', paintNetStatus);

  hydrate();
  renderSession();
  renderCurrent();
  renderHistoryStack();

  try {
    state.data = await loadData();
    const a = state.data.activities?.length || 0;
    const allRegions = new Set([GENERAL_REGION]);
    state.data.activities?.forEach((act) => act.regions?.forEach((r) => allRegions.add(r)));
  } catch (err) {
    els.activity.textContent = 'sin datos';
    els.region.textContent   = 'aún no disponibles';
    console.error('Failed to load data.json', err);
    hideSplash();
    return;
  }

  els.btn.addEventListener('click', generate);
  els.restartBtn.addEventListener('click', askRestart);
  els.logBtn.addEventListener('click', openLog);

  els.logModal.addEventListener('click', (e) => {
    if (e.target === els.logModal) closeLog();
  });

  // Restart confirmation: form method="dialog" closes the dialog and
  // sets returnValue to the submit button's value ("confirm" | "cancel").
  els.confirmModal.addEventListener('close', () => {
    if (els.confirmModal.returnValue === 'confirm') clearGame();
  });
  els.confirmModal.addEventListener('click', (e) => {
    if (e.target === els.confirmModal) els.confirmModal.close();
  });

  window.addEventListener('keydown', (e) => {
    if (e.target.closest('input, textarea, dialog')) return;
    if (els.logModal.open || els.confirmModal.open) return;
    if (e.code === 'Space' || e.code === 'Enter') {
      e.preventDefault();
      generate();
    }
  });

  hideSplash();
}

/* ---------- Service worker registration ----------------------------- */

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./service-worker.js').catch((err) => {
      console.warn('SW registration failed', err);
    });
  });
}

boot();
