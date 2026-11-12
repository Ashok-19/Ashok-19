import { text, textWidth, grid, loadSprite, placeSprite, svgDoc, fmt } from './pixel.mjs';

const ROCK = ['...XX...', '..XXXX..', '.XXXXXX.', 'XXXXXXXX', 'XXXXXXXX', '.XXXXXX.'];
const CLOUD = ['....XXXX......', '..XXXXXXXX....', 'XXXXXXXXXXXXXX'];

// ---------------------------------------------------------------- header
export function header(cfg, t) {
  const W = 900, H = 240, GROUND = 196, T = 3.2;
  const run1 = loadSprite('run-1'), run2 = loadSprite('run-2'), jump = loadSprite('jump');
  const dh = 76, dw = (run1.w / run1.h) * dh, dx = 70;
  const rockW = 32;
  const cross = (W + 20 - (dx + dw / 2 - rockW / 2)) / (W + 60) * 100; // % when rock is under the dino
  const j0 = cross - 8.5, j1 = cross + 8.5;

  const name = text(cfg.name, 0, 0, 10);
  const tag = text(cfg.tagline, 0, 0, 3);
  const textX = (w) => Math.round(dx + dw + 40 + (W - (dx + dw + 40) - w) / 2);
  const specks = Array.from({ length: 48 }, (_, i) => {
    const x = i * 37, y = GROUND + 10 + ((i * 7) % 4) * 4;
    return `<rect x="${x}" y="${y}" width="${i % 3 ? 4 : 10}" height="3"/>`;
  }).join('');

  const style = `
.run{animation:runv ${T}s steps(1,end) infinite}.air{animation:airv ${T}s steps(1,end) infinite}
@keyframes runv{0%{opacity:1}${fmt(j0)}%{opacity:0}${fmt(j1)}%{opacity:1}}
@keyframes airv{0%{opacity:0}${fmt(j0)}%{opacity:1}${fmt(j1)}%{opacity:0}}
.l1{animation:l1 .22s steps(1,end) infinite}.l2{animation:l2 .22s steps(1,end) infinite}
@keyframes l1{0%{opacity:1}50%{opacity:0}}@keyframes l2{0%{opacity:0}50%{opacity:1}}
.dino{animation:jump ${T}s infinite}
@keyframes jump{0%,${fmt(j0)}%{transform:translateY(0);animation-timing-function:cubic-bezier(.3,.7,.5,1)}
${fmt(cross)}%{transform:translateY(-78px);animation-timing-function:cubic-bezier(.5,0,.7,.3)}${fmt(j1)}%,100%{transform:translateY(0)}}
.rock{animation:rock ${T}s linear infinite}
@keyframes rock{from{transform:translateX(${W + 20}px)}to{transform:translateX(-40px)}}
.ground{animation:gr 1.1s linear infinite}@keyframes gr{to{transform:translateX(-${37 * 8}px)}}
.c1{animation:cl 16s linear infinite}.c2{animation:cl 23s linear -11s infinite}
@keyframes cl{from{transform:translateX(${W}px)}to{transform:translateX(-80px)}}
.cur{animation:blink 1s steps(1,end) infinite}@keyframes blink{50%{opacity:0}}`;

  const body =
    `<rect width="${W}" height="${H}" fill="${t.bg}"/>` +
    `<g fill="${t.faint}"><g class="c1"><g transform="translate(0 34)">${grid(CLOUD, 0, 0, 4)}</g></g>` +
    `<g class="c2"><g transform="translate(0 70)">${grid(CLOUD, 0, 0, 3)}</g></g></g>` +
    `<g fill="${t.fg}" transform="translate(${textX(name.width)} 44)">${name.svg}</g>` +
    `<g fill="${t.mid}" transform="translate(${textX(tag.width)} 130)">${tag.svg}` +
    `<rect class="cur" x="${tag.width + 8}" y="0" width="12" height="21" fill="${t.fg}"/></g>` +
    `<rect x="0" y="${GROUND}" width="${W}" height="3" fill="${t.fg}"/>` +
    `<g fill="${t.mid}" class="ground">${specks}</g>` +
    `<g fill="${t.fg}" class="rock"><g transform="translate(0 ${GROUND - 24})">${grid(ROCK, 0, 0, 4)}</g></g>` +
    `<g class="dino" fill="${t.fg}">` +
    `<g class="run"><g class="l1">${placeSprite(run1, t, dx, GROUND - dh + 2, dh)}</g>` +
    `<g class="l2">${placeSprite(run2, t, dx, GROUND - dh + 2, dh)}</g></g>` +
    `<g class="air">${placeSprite(jump, t, dx, GROUND - dh + 2, dh)}</g></g>`;
  return svgDoc(W, H, t, body, style);
}

// ---------------------------------------------------------------- section title
export function title(label, t) {
  const W = 900, H = 48, s = 4;
  const tx = text('> ' + label, 0, 10, s);
  const lineX = tx.width + 24;
  let dots = '';
  for (let x = lineX; x < W; x += 16) dots += `<rect x="${x}" y="${10 + 3 * s}" width="8" height="${s}"/>`;
  return svgDoc(W, H, t, `<g fill="${t.fg}">${tx.svg}</g><g fill="${t.faint}">${dots}</g>`);
}

// ---------------------------------------------------------------- tech stack
export function stack(items, icons, t) {
  const perRow = 7, cell = 124, W = perRow * cell, rowH = 120, s = 2;
  const rows = Math.ceil(items.length / perRow), H = rows * rowH + 8;
  let body = '';
  for (let r = 0; r < rows; r++) {
    const row = items.slice(r * perRow, (r + 1) * perRow);
    const off = (W - row.length * cell) / 2, ground = r * rowH + 64;
    body += `<rect x="0" y="${ground}" width="${W}" height="2" fill="${t.faint}"/>`;
    row.forEach(([key, label], i) => {
      const cx = off + i * cell + cell / 2;
      const ic = icons[key];
      if (ic) body += `<g fill="${t.fg}">${grid(ic, cx - 24, ground - 52, s)}</g>`;
      const lw = textWidth(label, 2);
      body += `<g fill="${t.mid}">${text(label, cx - lw / 2, ground + 16, 2).svg}</g>`;
    });
  }
  return svgDoc(W, H, t, body);
}

// ---------------------------------------------------------------- social button
export function social(s, icons, t) {
  const W = 272, H = 84;
  // pixel frame with notched corners
  const f = 4;
  const frame = `<g fill="${t.fg}"><rect x="${f}" y="0" width="${W - 2 * f}" height="${f}"/>` +
    `<rect x="${f}" y="${H - f}" width="${W - 2 * f}" height="${f}"/>` +
    `<rect x="0" y="${f}" width="${f}" height="${H - 2 * f}"/><rect x="${W - f}" y="${f}" width="${f}" height="${H - 2 * f}"/></g>`;
  const icon = `<g fill="${t.fg}">${grid(icons[s.icon], 20, 18, 2)}</g>`;
  const label = `<g fill="${t.mid}">${text(s.label, 88, 20, 2).svg}</g>`;
  const handle = `<g fill="${t.fg}">${text(s.handle, 88, 40, 3).svg}</g>`;
  return svgDoc(W, H, t, `<rect width="${W}" height="${H}" fill="${t.bg}"/>${frame}${icon}${label}${handle}`);
}

// ---------------------------------------------------------------- stats scoreboard
export function stats(d, t) {
  const W = 900, H = 168;
  const pad = (n, k = 5) => String(Math.max(0, n | 0)).padStart(k, '0');
  let body = '';
  // Big score line, dino-game style: HI <best streak>   <current streak>
  const hi = text('HI ' + pad(d.longestStreak), 0, 0, 6);
  const cur = text(pad(d.currentStreak), 0, 0, 6);
  const gap = 60, total = hi.width + gap + cur.width, x0 = (W - total) / 2;
  body += `<g fill="${t.mid}" transform="translate(${x0} 10)">${hi.svg}</g>`;
  body += `<g fill="${t.fg}" transform="translate(${x0 + hi.width + gap} 10)">${cur.svg}</g>`;
  const l1 = 'BEST STREAK', l2 = 'CURRENT STREAK';
  body += `<g fill="${t.mid}">${text(l1, x0 + hi.width - textWidth(l1, 2), 64, 2).svg}${text(l2, x0 + hi.width + gap, 64, 2).svg}</g>`;
  body += `<rect x="40" y="96" width="${W - 80}" height="2" fill="${t.faint}"/>`;
  const cells = [
    ['CONTRIBUTIONS', d.yearContributions, 'LAST 12 MONTHS'],
    ['STARS', d.stars, 'EARNED'],
    ['REPOS', d.repos, 'PUBLIC'],
    ['FOLLOWERS', d.followers, 'ON GITHUB'],
  ];
  const cw = (W - 80) / cells.length;
  cells.forEach(([lab, val, sub], i) => {
    const cx = 40 + i * cw + cw / 2, v = String(val);
    body += `<g fill="${t.fg}">${text(v, cx - textWidth(v, 4) / 2, 114, 4).svg}</g>`;
    body += `<g fill="${t.mid}">${text(lab, cx - textWidth(lab, 2) / 2, 148, 2).svg}</g>`;
  });
  return svgDoc(W, H, t, `<rect width="${W}" height="${H}" fill="${t.bg}"/>${body}`);
}

// ---------------------------------------------------------------- contribution hop
function rng(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let x = Math.imul(a ^ (a >>> 15), 1 | a); x ^= x + Math.imul(x ^ (x >>> 7), 61 | x); return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };
}

export function contrib(d, cfg, t, seed) {
  const STEP = 14, CELL = 11, LEFT = 20, TOP = 56;
  const weeks = d.weeks;
  const W = LEFT * 2 + weeks.length * STEP - (STEP - CELL), H = TOP + 7 * STEP + 44;
  const stand = loadSprite('stand'), jumpS = loadSprite('jump');
  const DH = 30, DW = (stand.w / stand.h) * DH;

  const tiles = [];
  weeks.forEach((wk, wi) => wk.forEach((day) => {
    if (!day) return;
    tiles.push({ x: LEFT + wi * STEP, y: TOP + day.weekday * STEP, level: day.level, count: day.count });
  }));

  // choose hop targets
  const r = rng(seed);
  const active = tiles.filter((c) => c.level > 0);
  for (let i = active.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [active[i], active[j]] = [active[j], active[i]]; }
  const path = active.slice(0, cfg.hop.count);

  // timeline
  const maxDist = Math.hypot(W, 7 * STEP);
  const pos = (c) => ({ x: c.x + CELL / 2, y: c.y + CELL * 0.8 });
  const ev = []; let time = 0.4;
  path.forEach((c, k) => {
    const p = pos(c);
    const arrive = time, depart = arrive + cfg.hop.land;
    let air = 0, h = 0;
    if (k < path.length - 1) {
      const q = pos(path[k + 1]), dist = Math.hypot(q.x - p.x, q.y - p.y);
      air = cfg.hop.airtime + cfg.hop.extraAir * (dist / maxDist);
      h = Math.min(60, 14 + dist * 0.09);
      ev.push({ p, q, arrive, depart, air, h, dir: Math.sign(q.x - p.x) });
    } else ev.push({ p, q: null, arrive, depart, air: 0, h: 0, dir: 0 });
    time = depart + air;
  });
  const lastLand = path.length ? ev[ev.length - 1].arrive : 0;
  const T = Math.max(4, lastLand + cfg.hop.endPause + 0.6);
  const P = (s) => fmt((s / T) * 100) + '%';

  // keyframes
  let move = '', arc = '', flip = '', pose = '';
  let facing = 1;
  ev.forEach((e, k) => {
    const tr = `transform:translate(${fmt(e.p.x)}px,${fmt(e.p.y)}px)`;
    move += `${P(e.arrive)}{${tr}}${P(e.depart)}{${tr}}`;
    if (e.q) {
      const mid = e.depart + e.air / 2, nd = e.depart + e.air;
      arc += `${P(e.depart)}{transform:translateY(0);animation-timing-function:cubic-bezier(.33,.66,.66,1)}` +
        `${P(mid)}{transform:translateY(-${fmt(e.h)}px);animation-timing-function:cubic-bezier(.33,0,.66,.33)}` +
        `${P(nd)}{transform:translateY(0)}`;
      if (e.dir) facing = e.dir;
      flip += `${P(e.depart)}{transform:scaleX(${facing})}`;
      pose += `${P(e.arrive)}{opacity:0}${P(e.depart)}{opacity:1}`;
    } else pose += `${P(e.arrive)}{opacity:0}`;
  });
  const first = ev[0];
  if (first) {
    move = `0%{transform:translate(${fmt(first.p.x)}px,${fmt(first.p.y)}px)}` + move;
    flip = `0%{transform:scaleX(${ev[0].dir || 1})}` + flip;
  }
  const fadeOut = lastLand + 0.7, reset = T - 0.5;
  const fade = `0%{opacity:0}${P(0.3)}{opacity:1}${P(fadeOut)}{opacity:1}${P(fadeOut + 0.3)}{opacity:0}100%{opacity:0}`;

  let tileCss = '', tileSvg = '';
  const idx = new Map(path.map((c, k) => [c, k]));
  tiles.forEach((c) => {
    const k = idx.get(c);
    const fill = t.green[c.level];
    if (k === undefined) { tileSvg += `<rect x="${c.x}" y="${c.y}" width="${CELL}" height="${CELL}" fill="${fill}"/>`; return; }
    const g = ev[k].arrive + 0.04;
    tileCss += `.t${k}{animation:t${k} ${fmt(T)}s linear infinite}@keyframes t${k}{0%,${P(g)}{fill:${fill}}${P(g + 0.12)},${P(reset)}{fill:${t.visited}}${P(reset + 0.4)},100%{fill:${fill}}}`;
    tileSvg += `<rect class="t${k}" x="${c.x}" y="${c.y}" width="${CELL}" height="${CELL}" fill="${fill}"/>`;
  });

  const style =
    `.mv{animation:mv ${fmt(T)}s linear infinite}@keyframes mv{${move}}` +
    `.arc{animation:arc ${fmt(T)}s linear infinite}@keyframes arc{0%{transform:translateY(0)}${arc}}` +
    `.flip{animation:flip ${fmt(T)}s steps(1,end) infinite}@keyframes flip{${flip}}` +
    `.air{animation:air ${fmt(T)}s steps(1,end) infinite}@keyframes air{0%{opacity:0}${pose}}` +
    `.gnd{animation:gnd ${fmt(T)}s steps(1,end) infinite}@keyframes gnd{0%{opacity:1}${pose.replace(/opacity:0/g, 'opacity:X').replace(/opacity:1/g, 'opacity:0').replace(/opacity:X/g, 'opacity:1')}}` +
    `.fade{animation:fade ${fmt(T)}s linear infinite}@keyframes fade{${fade}}` + tileCss;

  const dino = (sp) => placeSprite(sp, t, -DW / 2, -DH, DH);
  const caption = `${d.yearContributions} CONTRIBUTIONS IN THE LAST YEAR`;
  const legendX = W - LEFT - (5 * 14) - textWidth('MORE', 2) - 8;
  let legend = `<g fill="${t.mid}">${text('LESS', legendX - textWidth('LESS', 2) - 8, H - 26, 2).svg}${text('MORE', legendX + 5 * 14 + 2, H - 26, 2).svg}</g>`;
  t.green.forEach((g, i) => { legend += `<rect x="${legendX + i * 14}" y="${H - 27}" width="${CELL}" height="${CELL}" fill="${g}"/>`; });

  const body =
    `<rect width="${W}" height="${H}" fill="${t.bg}"/>` + tileSvg +
    `<g fill="${t.mid}">${text(caption, LEFT, H - 26, 2).svg}</g>` + legend +
    (path.length ? `<g class="fade"><g class="mv"><g class="arc"><g class="flip" fill="${t.fg}">` +
      `<g class="gnd">${dino(stand)}</g><g class="air">${dino(jumpS)}</g></g></g></g></g>` : '');
  return svgDoc(W, H, t, body, style);
}

// ---------------------------------------------------------------- footer
export function footer(t) {
  const W = 900, H = 120, stand = loadSprite('stand');
  const msg = text('THANKS FOR STOPPING BY!', 0, 0, 4);
  const dh = 48, dw = (stand.w / stand.h) * dh;
  const total = dw + 24 + msg.width, x0 = (W - total) / 2;
  const style = `.bob{animation:bob 1.6s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-6px)}}`;
  return svgDoc(W, H, t,
    `<rect width="${W}" height="${H}" fill="${t.bg}"/>` +
    `<g class="bob" fill="${t.fg}">${placeSprite(stand, t, x0, 92 - dh, dh)}</g>` +
    `<rect x="${x0 - 40}" y="92" width="${total + 80}" height="3" fill="${t.fg}"/>` +
    `<g fill="${t.fg}" transform="translate(${x0 + dw + 24} 58)">${msg.svg}</g>`, style);
}
