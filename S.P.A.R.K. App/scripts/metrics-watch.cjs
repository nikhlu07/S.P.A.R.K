#!/usr/bin/env node
/*
  metrics-watch.cjs
  - Runs the Hardhat metrics collector on an interval and mirrors results to public/analytics
  - Usage: node scripts/metrics-watch.cjs --interval=300000
*/

const { spawn } = require('child_process');

function getArg(name, def) {
  const match = process.argv.find((a) => a.startsWith(`--${name}=`));
  if (match) return match.split('=')[1];
  const idx = process.argv.indexOf(`--${name}`);
  if (idx !== -1 && process.argv[idx + 1] && !process.argv[idx + 1].startsWith('--')) return process.argv[idx + 1];
  return def;
}

const DEFAULT_INTERVAL = 5 * 60 * 1000; // 5 minutes
const intervalMs = Number(process.env.METRICS_INTERVAL_MS || getArg('interval', DEFAULT_INTERVAL));

if (Number.isNaN(intervalMs) || intervalMs <= 0) {
  console.error(`[metrics-watch] Invalid interval: ${intervalMs}`);
  process.exit(1);
}

let timer = null;
let running = false;
let runCount = 0;

function scheduleNext() {
  clearTimeout(timer);
  timer = setTimeout(runOnce, intervalMs);
}

function runOnce() {
  if (running) return; // prevent overlap
  running = true;
  runCount += 1;
  const start = new Date();
  console.log(`\n[metrics-watch] Run #${runCount} starting at ${start.toISOString()} (interval ${intervalMs} ms)`);

  // Use shell to ensure compatibility on Windows for npx resolution
  const child = spawn('npx', ['hardhat', 'run', 'scripts/collectMetrics.cjs', '--network', 'kaiaTestnet'], {
    stdio: 'inherit',
    env: process.env,
    shell: true,
    windowsHide: true,
  });

  child.on('exit', (code) => {
    const end = new Date();
    console.log(`[metrics-watch] Run #${runCount} finished with code ${code} at ${end.toISOString()} (duration ${(end - start) / 1000}s)`);
    running = false;
    scheduleNext();
  });

  child.on('error', (err) => {
    const end = new Date();
    console.error(`[metrics-watch] Run #${runCount} failed to spawn: ${err?.message}`);
    running = false;
    scheduleNext();
  });
}

console.log(`[metrics-watch] Starting watcher with interval ${intervalMs} ms. Press Ctrl+C to stop.`);
runOnce();

process.on('SIGINT', () => {
  console.log('\n[metrics-watch] Caught SIGINT, stopping watcher.');
  clearTimeout(timer);
  process.exit(0);
});