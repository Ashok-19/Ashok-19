import { readFileSync, existsSync } from 'node:fs';

const ROOT = new URL('../../', import.meta.url);

// ---------- themes ----------
export const THEMES = {
  light: {
    bg: '#ffffff', fg: '#1f2328', mid: '#8c959f', faint: '#d0d7de',
    empty: '#ebedf0', visited: '#afb8c1',
    green: ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'],
  },
  dark: {
    bg: '#0d1117', fg: '#e6edf3', mid: '#7d8590', faint: '#30363d',
    empty: '#161b22', visited: '#484f58',
    green: ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'],
  },
};

// ---------- 5x7 pixel font ----------
const G = {
  A: '01110 10001 10001 11111 10001 10001 10001', B: '11110 10001 10001 11110 10001 10001 11110',
  C: '01111 10000 10000 10000 10000 10000 01111', D: '11110 10001 10001 10001 10001 10001 11110',
  E: '11111 10000 10000 11110 10000 10000 11111', F: '11111 10000 10000 11110 10000 10000 10000',
  G: '01111 10000 10000 10011 10001 10001 01111', H: '10001 10001 10001 11111 10001 10001 10001',
  I: '11111 00100 00100 00100 00100 00100 11111', J: '00111 00001 00001 00001 00001 10001 01110',
  K: '10001 10010 10100 11000 10100 10010 10001', L: '10000 10000 10000 10000 10000 10000 11111',
  M: '10001 11011 10101 10101 10001 10001 10001', N: '10001 11001 10101 10011 10001 10001 10001',
  O: '01110 10001 10001 10001 10001 10001 01110', P: '11110 10001 10001 11110 10000 10000 10000',
  Q: '01110 10001 10001 10001 10101 10010 01101', R: '11110 10001 10001 11110 10100 10010 10001',
  S: '01111 10000 10000 01110 00001 00001 11110', T: '11111 00100 00100 00100 00100 00100 00100',
  U: '10001 10001 10001 10001 10001 10001 01110', V: '10001 10001 10001 10001 10001 01010 00100',
  W: '10001 10001 10001 10101 10101 10101 01010', X: '10001 10001 01010 00100 01010 10001 10001',
  Y: '10001 10001 01010 00100 00100 00100 00100', Z: '11111 00001 00010 00100 01000 10000 11111',
  0: '01110 10001 10011 10101 11001 10001 01110', 1: '00100 01100 00100 00100 00100 00100 01110',
  2: '01110 10001 00001 00010 00100 01000 11111', 3: '11110 00001 00001 01110 00001 00001 11110',
  4: '00010 00110 01010 10010 11111 00010 00010', 5: '11111 10000 11110 00001 00001 10001 01110',
  6: '00110 01000 10000 11110 10001 10001 01110', 7: '11111 00001 00010 00100 01000 01000 01000',
  8: '01110 10001 10001 01110 10001 10001 01110', 9: '01110 10001 10001 01111 00001 00010 01100',
  '+': '00000 00100 00100 11111 00100 00100 00000', '-': '00000 00000 00000 11111 00000 00000 00000',
  '.': '00000 00000 00000 00000 00000 00000 00100', ':': '00000 00100 00000 00000 00000 00100 00000',
  '!': '00100 00100 00100 00100 00100 00000 00100', '/': '00001 00010 00010 00100 01000 01000 10000',
  '>': '01000 00100 00010 00001 00010 00100 01000', ' ': '00000 00000 00000 00000 00000 00000 00000',
};

/** Pixel text as merged <rect>s. Returns { svg, width, height }. */
export function text(str, x, y, size, attrs = '') {
  let out = '', cx = x;
  for (const ch of String(str).toUpperCase()) {
    const glyph = (G[ch] ?? G[' ']).split(' ');
    glyph.forEach((row, j) => {
      for (let i = 0; i < 5; i++) {
        if (row[i] !== '1') continue;
        let e = i;
        while (e < 5 && row[e] === '1') e++;
        out += `<rect x="${cx + i * size}" y="${y + j * size}" width="${(e - i) * size}" height="${size}"/>`;
        i = e - 1;
      }
    });
    cx += 6 * size;
  }
  const width = Math.max(0, cx - x - size);
  return { svg: `<g${attrs ? ' ' + attrs : ''}>${out}</g>`, width, height: 7 * size };
}
export const textWidth = (str, size) => Math.max(0, String(str).length * 6 * size - size);

/** Pixel grid (array of 'X.' strings) as merged <rect>s. */
export function grid(rows, x, y, size) {
  let out = '';
  rows.forEach((r, j) => {
    for (let i = 0; i < r.length; i++) {
      if (r[i] !== 'X') continue;
      let e = i;
      while (e < r.length && r[e] === 'X') e++;
      out += `<rect x="${x + i * size}" y="${y + j * size}" width="${(e - i) * size}" height="${size}"/>`;
      i = e - 1;
    }
  });
  return out;
}

// ---------- icons ----------
export function loadIcons() {
  const read = (f) => JSON.parse(readFileSync(new URL('scripts/data/' + f, ROOT), 'utf8'));
  return { ...read('icons.json'), ...read('icons-custom.json') };
}

// ---------- dino sprite ----------
function luma(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = [...h].map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
}
const NAMED = { black: '#000000', white: '#ffffff' };

/**
 * Loads assets/dino/<pose>.svg (falls back to stand.svg) and returns
 * { w, h, render(theme) } where render gives the inner SVG markup recoloured
 * for the theme: dark colours -> fg, light colours -> bg.
 */
export function loadSprite(pose) {
  let file = new URL(`assets/dino/${pose}.svg`, ROOT);
  if (!existsSync(file)) file = new URL('assets/dino/stand.svg', ROOT);
  const raw = readFileSync(file, 'utf8');
  const open = raw.match(/<svg\b[^>]*>/i)[0];
  const vb = (open.match(/viewBox\s*=\s*["']([^"']+)["']/i)?.[1] ?? '').trim().split(/[\s,]+/).map(Number);
  let [vx, vy, w, h] = vb.length === 4 ? vb : [0, 0,
    parseFloat(open.match(/width\s*=\s*["']([\d.]+)/i)?.[1] ?? 100),
    parseFloat(open.match(/height\s*=\s*["']([\d.]+)/i)?.[1] ?? 100)];
  const inner = raw
    .slice(raw.indexOf(open) + open.length, raw.lastIndexOf('</svg>'))
    .replace(/<\?xml[\s\S]*?\?>|<!--[\s\S]*?-->|<metadata[\s\S]*?<\/metadata>|<title[\s\S]*?<\/title>/gi, '');
  // Prefix ids so several poses can live in one file without clashing.
  const pfx = 'd-' + pose + '-';
  const scoped = inner
    .replace(/\bid="([^"]+)"/g, `id="${pfx}$1"`)
    .replace(/url\(#([^)]+)\)/g, `url(#${pfx}$1)`)
    .replace(/(xlink:)?href="#([^"]+)"/g, (m, x, id) => `${x ?? ''}href="#${pfx}${id}"`);
  return {
    w, h,
    render(theme) {
      const re = /(#[0-9a-f]{3,8}\b|\b(?:black|white)\b)/gi;
      const body = scoped.replace(/(fill|stroke|stop-color)\s*(=\s*["']|:\s*)([^"';)]+)/gi, (m, prop, sep, val) =>
        prop + sep + val.replace(re, (c) => (luma(NAMED[c.toLowerCase()] ?? c) < 128 ? theme.fg : theme.bg)));
      return `<svg viewBox="${vx} ${vy} ${w} ${h}" overflow="visible">${body}</svg>`;
    },
  };
}

/** Places a sprite pose at (x, y) scaled to height `ht`. */
export function placeSprite(sprite, theme, x, y, ht, attrs = '') {
  const wd = (sprite.w / sprite.h) * ht;
  return `<g${attrs ? ' ' + attrs : ''} transform="translate(${x} ${y})">` +
    sprite.render(theme).replace('<svg ', `<svg width="${wd}" height="${ht}" `) + '</g>';
}

export const svgDoc = (w, h, theme, body, style = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" shape-rendering="crispEdges">` +
  (style ? `<style>${style}</style>` : '') + body + '</svg>\n';

export const fmt = (n) => (Math.round(n * 1000) / 1000).toString();
