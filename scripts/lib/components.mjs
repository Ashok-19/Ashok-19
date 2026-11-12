import { text, textWidth, grid, loadSprite, placeSprite, svgDoc, fmt } from './pixel.mjs';

const CLOUD = ['....XXXX......', '..XXXXXXXX....', 'XXXXXXXXXXXXXX'];

// ---------------------------------------------------------------- header
// The dino runs and jumps over the tech-stack logos as they scroll past.
export function header(cfg, icons, t) {
  const W = 900, H = 304, GROUND = 272, FLY = 142;
  const SPEED = 260, GAP = 1.8, AIR = 0.7, APEX = 84, S = 2;
  const run1 = loadSprite('run-1'), run2 = loadSprite('run-2'), jump = loadSprite('jump');
  const dh = 76, dw = (run1.w / run1.h) * dh, dx = 70;

  const obs = cfg.stack.filter(([k]) => icons[k]).map(([k, , fly]) => ({ rows: icons[k], fly: fly === 'fly' }));
  const T = obs.length * GAP;
  const travel = (W + 80) / SPEED;
  // seconds from an obstacle's start until it is centred under the dino
  const toCross = (W + 10 + 24 - (dx + dw / 2)) / SPEED;
  let lead = 0;
  const crossings = () => obs.flatMap((o, i) => (o.fly ? [] : [(i * GAP + lead + toCross) % T]));
  while (crossings().some((c) => c < AIR / 2 + 0.05 || c > T - AIR / 2 - 0.05)) lead += 0.1;
  const P = (sec) => fmt((sec / T) * 100) + '%';

  let jumpKf = '0%{transform:translateY(0)}', runKf = '0%{opacity:1}', airKf = '0%{opacity:0}';
  for (const c of crossings().sort((x, y) => x - y)) {
    const a = c - AIR / 2, z = c + AIR / 2;
    jumpKf += `${P(a)}{transform:translateY(0);animation-timing-function:cubic-bezier(.33,.66,.66,1)}` +
      `${P(c)}{transform:translateY(-${APEX}px);animation-timing-function:cubic-bezier(.33,0,.66,.33)}${P(z)}{transform:translateY(0)}`;
    runKf += `${P(a)}{opacity:0}${P(z)}{opacity:1}`;
    airKf += `${P(a)}{opacity:1}${P(z)}{opacity:0}`;
  }

  let obsSvg = '';
  obs.forEach(({ rows, fly }, i) => {
    let last = rows.length - 1;
    while (last > 0 && !rows[last].includes('X')) last--;
    const y = fly ? FLY : GROUND - 1 - (last + 1) * S;
    const art = `<g transform="translate(0 ${y})">${grid(rows, 0, 0, S)}</g>`;
    obsSvg += `<g class="ob" style="animation-delay:${fmt(i * GAP + lead)}s">` +
      (fly ? `<g class="bob" style="animation-delay:-${fmt(i * 0.37)}s">${art}</g>` : art) + '</g>';
  });

  const name = text(cfg.name, 0, 0, 10);
  const tag = text(cfg.tagline, 0, 0, 3);
  const cx = (w) => Math.round((W - w) / 2);
  const specks = Array.from({ length: 48 }, (_, i) => {
    const x = i * 37, y = GROUND + 10 + ((i * 7) % 4) * 4;
    return `<rect x="${x}" y="${y}" width="${i % 3 ? 4 : 10}" height="3"/>`;
  }).join('');

  const style = `
.ob{transform:translateX(${W + 10}px);animation:ob ${fmt(T)}s linear infinite backwards}
@keyframes ob{0%{transform:translateX(${W + 10}px)}${P(travel)}{transform:translateX(-70px)}100%{transform:translateX(-70px)}}
.dino{animation:jump ${fmt(T)}s linear infinite}@keyframes jump{${jumpKf}}
.run{animation:runv ${fmt(T)}s steps(1,end) infinite}@keyframes runv{${runKf}}
.air{animation:airv ${fmt(T)}s steps(1,end) infinite}@keyframes airv{${airKf}}
.l1{animation:l1 .22s steps(1,end) infinite}.l2{animation:l2 .22s steps(1,end) infinite}
@keyframes l1{0%{opacity:1}50%{opacity:0}}@keyframes l2{0%{opacity:0}50%{opacity:1}}
.ground{animation:gr ${fmt((37 * 8) / SPEED)}s linear infinite}@keyframes gr{to{transform:translateX(-${37 * 8}px)}}
.bob{animation:bob 1.2s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-6px)}}
.c1{animation:cl 30s linear infinite}.c2{animation:cl 42s linear -19s infinite}
@keyframes cl{from{transform:translateX(${W}px)}to{transform:translateX(-80px)}}`;

  const body =
    `<rect width="${W}" height="${H}" fill="${t.bg}"/>` +
    `<g fill="${t.faint}"><g class="c1"><g transform="translate(0 2)">${grid(CLOUD, 0, 0, 2)}</g></g>` +
    `<g class="c2"><g transform="translate(0 8)">${grid(CLOUD, 0, 0, 2)}</g></g></g>` +
    `<g fill="${t.fg}" transform="translate(${cx(name.width)} 26)">${name.svg}</g>` +
    `<g fill="${t.mid}" transform="translate(${cx(tag.width)} 112)">${tag.svg}</g>` +
    `<rect x="0" y="${GROUND}" width="${W}" height="3" fill="${t.fg}"/>` +
    `<g fill="${t.mid}" class="ground">${specks}</g>` +
    `<g fill="${t.fg}">${obsSvg}</g>` +
    `<g class="dino" fill="${t.fg}">` +
    `<g class="run"><g class="l1">${placeSprite(run1, t, dx, GROUND - dh + 2, dh)}</g>` +
    `<g class="l2">${placeSprite(run2, t, dx, GROUND - dh + 2, dh)}</g></g>` +
    `<g class="air">${placeSprite(jump, t, dx, GROUND - dh + 2, dh)}</g></g>`;
  return svgDoc(W, H, t, body, style);
}

// ---------------------------------------------------------------- section title
export function title(label, t) {
  const W = 900, H = 64, s = 4;
  const tx = text('> ' + label, 0, 26, s);
  const lineX = tx.width + 24;
  let dots = '';
  for (let x = lineX; x < W; x += 16) dots += `<rect x="${x}" y="${26 + 3 * s}" width="8" height="${s}"/>`;
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
      if (ic) {
        let last = ic.length - 1;
        while (last > 0 && !ic[last].includes('X')) last--;
        body += `<g fill="${t.fg}">${grid(ic, cx - 24, ground - 6 - (last + 1) * s, s)}</g>`;
      }
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

// ---------------------------------------------------------------- stats
export function stats(d, t) {
  const W = 900, H = 112, cells = [
    [d.yearContributions, 'CONTRIBUTIONS'],
    [d.currentStreak, 'CURRENT STREAK'],
    [d.longestStreak, 'BEST STREAK'],
    [d.stars, 'STARS'],
  ];
  const cw = W / cells.length;
  let body = '';
  cells.forEach(([val, lab], i) => {
    const cx = i * cw + cw / 2, v = String(val);
    body += `<g fill="${t.fg}">${text(v, cx - textWidth(v, 6) / 2, 22, 6).svg}</g>`;
    body += `<g fill="${t.mid}">${text(lab, cx - textWidth(lab, 2) / 2, 80, 2).svg}</g>`;
  });
  return svgDoc(W, H, t, `<rect width="${W}" height="${H}" fill="${t.bg}"/>${body}`);
}

// ---------------------------------------------------------------- contribution hop
export function contrib(d, cfg, t) {
  const STEP = 14, CELL = 11, LEFT = 20, TOP = 48;
  const weeks = d.weeks;
  const W = LEFT * 2 + weeks.length * STEP - (STEP - CELL), H = TOP + 7 * STEP + 44;
  const stand = loadSprite('stand'), jumpS = loadSprite('jump');
  const DH = 30, DW = (stand.w / stand.h) * DH;

  const tiles = [];
  weeks.forEach((wk, wi) => wk.forEach((day) => {
    if (!day) return;
    tiles.push({ x: LEFT + wi * STEP, y: TOP + day.weekday * STEP, level: day.level, count: day.count });
  }));

  // hop order: start at the earliest active day, then always the nearest unvisited one
  const todo = tiles.filter((c) => c.level > 0);
  const path = [];
  let cur = todo.shift();
  while (cur) {
    path.push(cur);
    let best = -1, bd = Infinity;
    todo.forEach((c, i) => {
      const d = Math.hypot(c.x - cur.x, c.y - cur.y);
      if (d < bd - 0.01) { bd = d; best = i; }
    });
    cur = best < 0 ? null : todo.splice(best, 1)[0];
  }

  // timeline
  const pos = (c) => ({ x: c.x + CELL / 2, y: c.y + CELL * 0.8 });
  const ev = []; let time = 0.4;
  path.forEach((c, k) => {
    const p = pos(c);
    const arrive = time, depart = arrive + cfg.hop.land;
    let air = 0, h = 0;
    if (k < path.length - 1) {
      const q = pos(path[k + 1]), dist = Math.hypot(q.x - p.x, q.y - p.y);
      air = cfg.hop.airtime + Math.min(cfg.hop.extraAir, (dist - STEP) * 0.004);
      h = Math.min(28, 10 + dist * 0.06);
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
    tileCss += `.t${k}{animation:t${k} ${fmt(T)}s linear infinite}@keyframes t${k}{0%,${P(g)}{fill:${fill}}${P(g + 0.12)},${P(reset)}{fill:${t.green[0]}}${P(reset + 0.4)},100%{fill:${fill}}}`;
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
  const W = 900, H = 96, stand = loadSprite('stand');
  const dh = 48, dw = (stand.w / stand.h) * dh, x0 = (W - dw) / 2, ground = 76;
  const style = `.bob{animation:bob 1.6s ease-in-out infinite}@keyframes bob{50%{transform:translateY(-6px)}}`;
  return svgDoc(W, H, t,
    `<rect width="${W}" height="${H}" fill="${t.bg}"/>` +
    `<g class="bob" fill="${t.fg}">${placeSprite(stand, t, x0, ground - dh + 1, dh)}</g>` +
    `<rect x="${W / 2 - 90}" y="${ground}" width="180" height="3" fill="${t.fg}"/>`, style);
}
