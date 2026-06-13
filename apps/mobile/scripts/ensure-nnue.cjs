#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const mobileRoot = path.resolve(__dirname, '..');

function resolvePackageRoot() {
  const candidates = [
    path.join(mobileRoot, 'node_modules', '@og-nav', 'expo-stockfish'),
    path.join(mobileRoot, '..', '..', 'node_modules', '@og-nav', 'expo-stockfish'),
  ];
  return candidates.find((dir) => fs.existsSync(dir));
}

const pkgRoot = resolvePackageRoot();
if (!pkgRoot) {
  console.error('[ensure-nnue] @og-nav/expo-stockfish is not installed.');
  process.exit(1);
}

const srcDir = path.join(pkgRoot, 'cpp', 'Stockfish', 'src');
const manifestPath = path.join(srcDir, 'nnue-manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const required = [manifest.big, manifest.small].filter(Boolean);
const missing = required.filter((name) => !fs.existsSync(path.join(srcDir, name)));

if (missing.length === 0) {
  console.log('[ensure-nnue] NNUE files present.');
  process.exit(0);
}

console.error('[ensure-nnue] Missing NNUE files:', missing.join(', '));
console.error('Run from apps/mobile: npm run nnue');
process.exit(1);
