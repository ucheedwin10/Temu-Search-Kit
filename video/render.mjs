// Renders video/compose.html to an MP4, frame by frame.
//
//   node video/render.mjs                    -> video/temu-search-kit.mp4 (30fps)
//   node video/render.mjs --fps 60
//   node video/render.mjs --stills 2,8,17    -> PNG stills in video/stills/ for review
//
// Needs Playwright's Chromium and ffmpeg on PATH.
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = await import('/opt/node22/lib/node_modules/playwright/index.mjs')); }

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const opt = name => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : null; };
const fps = Number(opt('fps') || 30);
const stills = opt('stills');
const out = opt('out') || join(here, 'temu-search-kit.mp4');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
await page.goto(pathToFileURL(join(here, 'compose.html')).href + '?render');
await page.evaluate(() => document.fonts.ready);
const duration = await page.evaluate(() => window.DURATION);
const stage = page.locator('#stage');

if (stills) {
  const dir = join(here, 'stills');
  mkdirSync(dir, { recursive: true });
  for (const t of stills.split(',').map(Number)) {
    await page.evaluate(t => window.render(t), t);
    await stage.screenshot({ path: join(dir, `t${String(t).padStart(5, '0')}.png`) });
  }
  await browser.close();
  process.exit(0);
}

const ff = spawn('ffmpeg', [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
  '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',   // silent track: some apps reject video-only files
  '-map', '0:v', '-map', '1:a', '-shortest',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '64k',
  '-movflags', '+faststart', out
], { stdio: ['pipe', 'inherit', 'inherit'] });

const total = Math.round(duration * fps);
for (let i = 0; i < total; i++) {
  await page.evaluate(t => window.render(t), i / fps);
  const buf = await stage.screenshot({ type: 'png' });
  if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
  if (i % fps === 0) process.stdout.write(`\r${Math.round(i / total * 100)}%`);
}
ff.stdin.end();
await new Promise((res, rej) => ff.on('close', c => c === 0 ? res() : rej(new Error('ffmpeg exited ' + c))));
await browser.close();
console.log('\rwrote', out);
