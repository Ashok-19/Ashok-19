// Builds every README image into ./dist (light + dark versions).
//   GITHUB_TOKEN=... node scripts/build.mjs        real data
//   node scripts/build.mjs --sample                made-up data for previews
import { mkdirSync, writeFileSync } from 'node:fs';
import cfg from './config.mjs';
import { THEMES, loadIcons } from './lib/pixel.mjs';
import * as C from './lib/components.mjs';

const OUT = new URL('../dist/', import.meta.url);
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

async function fetchData(login, token) {
  const query = `query($login:String!){user(login:$login){
    followers{totalCount}
    repositories(ownerAffiliations:OWNER,privacy:PUBLIC,first:100,orderBy:{field:STARGAZERS,direction:DESC}){totalCount nodes{stargazerCount}}
    contributionsCollection{contributionCalendar{totalContributions weeks{contributionDays{date weekday contributionCount contributionLevel}}}}}}`;
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: { Authorization: `bearer ${token}`, 'Content-Type': 'application/json', 'User-Agent': 'readme-builder' },
    body: JSON.stringify({ query, variables: { login } }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) throw new Error('GitHub API: ' + JSON.stringify(json.errors ?? json));
  const u = json.data.user, cal = u.contributionsCollection.contributionCalendar;
  const weeks = cal.weeks.map((w) => {
    const days = Array(7).fill(null);
    w.contributionDays.forEach((d) => { days[d.weekday] = { date: d.date, weekday: d.weekday, count: d.contributionCount, level: LEVEL[d.contributionLevel] ?? 0 }; });
    return days;
  });
  return {
    weeks, yearContributions: cal.totalContributions, followers: u.followers.totalCount,
    repos: u.repositories.totalCount, stars: u.repositories.nodes.reduce((a, r) => a + r.stargazerCount, 0),
  };
}

function sampleData() {
  let s = 7; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const weeks = [], start = new Date(Date.UTC(2025, 10, 16));
  let total = 0;
  for (let w = 0; w < 53; w++) {
    const days = Array(7).fill(null);
    for (let d = 0; d < 7; d++) {
      if (w === 52 && d > 3) break;
      const busy = r(), count = busy < 0.45 ? 0 : Math.floor(r() * (busy > 0.9 ? 20 : 6)) + 1;
      const level = count === 0 ? 0 : count < 3 ? 1 : count < 6 ? 2 : count < 10 ? 3 : 4;
      const date = new Date(start.getTime() + (w * 7 + d) * 864e5).toISOString().slice(0, 10);
      days[d] = { date, weekday: d, count, level }; total += count;
    }
    weeks.push(days);
  }
  return { weeks, yearContributions: total, followers: 42, repos: 27, stars: 118 };
}

function streaks(weeks) {
  const days = weeks.flat().filter(Boolean).sort((a, b) => a.date.localeCompare(b.date));
  let longest = 0, run = 0;
  for (const d of days) { run = d.count > 0 ? run + 1 : 0; longest = Math.max(longest, run); }
  let i = days.length - 1, current = 0;
  if (i >= 0 && days[i].count === 0) i--; // today not counted until you contribute
  for (; i >= 0 && days[i].count > 0; i--) current++;
  return { longestStreak: longest, currentStreak: current };
}

const sample = process.argv.includes('--sample');
const token = process.env.GH_STATS_TOKEN || process.env.GITHUB_TOKEN;
if (!sample && !token) { console.error('Set GITHUB_TOKEN, or pass --sample'); process.exit(1); }
const data = sample ? sampleData() : await fetchData(cfg.user, token);
Object.assign(data, streaks(data.weeks));

const icons = loadIcons();
mkdirSync(OUT, { recursive: true });
const out = (f, s) => writeFileSync(new URL(f, OUT), s);

for (const [name, t] of Object.entries(THEMES)) {
  out(`header-${name}.svg`, C.header(cfg, icons, t));
  for (const [id, label] of [['about', 'WHO AM I'], ['stack', 'TECH STACK'], ['stats', 'GITHUB STATS'], ['contrib', 'CONTRIBUTIONS'], ['connect', 'CONNECT']])
    out(`title-${id}-${name}.svg`, C.title(label, t));
  out(`stack-${name}.svg`, C.stack(cfg.stack, icons, t));
  for (const s of cfg.socials) out(`social-${s.id}-${name}.svg`, C.social(s, icons, t));
  out(`stats-${name}.svg`, C.stats(data, t));
  out(`contrib-${name}.svg`, C.contrib(data, cfg, t));
  out(`footer-${name}.svg`, C.footer(t));
}
console.log(`built dist/ (${sample ? 'sample' : 'live'} data, ${data.yearContributions} contributions)`);
