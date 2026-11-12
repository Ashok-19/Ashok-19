// One-time dev tool: turns Simple Icons (CC0) logos into pixel grids saved in
// scripts/data/icons.json, so the daily build needs no dependencies.
// Usage (needs `npm i simple-icons playwright` somewhere on NODE_PATH):
//   node scripts/pixelate-icons.mjs
import { createRequire } from 'node:module';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
const require = createRequire(import.meta.url);
const si = require('simple-icons');
const { chromium } = require('playwright');

const GRID = 24;
const SLUGS = ['git', 'linux', 'docker', 'python', 'pytorch', 'opencv', 'react',
  'mongodb', 'mysql', 'firebase', 'ubuntu', 'vercel', 'kaggle', 'gmail'];
const OUT = new URL('./data/icons.json', import.meta.url);

const icons = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : {};
const browser = await chromium.launch();
const page = await browser.newPage();
for (const slug of SLUGS) {
  const key = 'si' + slug[0].toUpperCase() + slug.slice(1);
  const icon = si[key];
  if (!icon) { console.warn('missing', slug); continue; }
  icons[slug] = await page.evaluate(({ path, GRID }) => {
    const S = 10, N = GRID * S, c = document.createElement('canvas');
    c.width = c.height = N;
    const g = c.getContext('2d');
    g.scale(N / 24, N / 24);
    g.fill(new Path2D(path));
    const d = g.getImageData(0, 0, N, N).data, rows = [];
    for (let y = 0; y < GRID; y++) {
      let r = '';
      for (let x = 0; x < GRID; x++) {
        let a = 0;
        for (let j = 0; j < S; j++) for (let i = 0; i < S; i++)
          a += d[((y * S + j) * N + x * S + i) * 4 + 3];
        r += a / (S * S * 255) > 0.42 ? 'X' : '.';
      }
      rows.push(r);
    }
    return rows;
  }, { path: icon.path, GRID });
  console.log(slug + '\n' + icons[slug].join('\n'));
}
await browser.close();
writeFileSync(OUT, JSON.stringify(icons, null, 1) + '\n');
