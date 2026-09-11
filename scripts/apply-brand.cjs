#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
function readJson(p) { return JSON.parse(fs.readFileSync(p, 'utf8')); }
function ensureFile(p, label) {
  if (!fs.existsSync(p)) throw new Error(`${label} not found: ${p}`);
}
function copyIfExists(src, dst) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  fs.copyFileSync(src, dst);
  return true;
}
function replaceInTextFile(file, replacements) {
  if (!fs.existsSync(file)) return false;
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const [from, to] of replacements) after = after.split(from).join(to);
  if (after !== before) fs.writeFileSync(file, after, 'utf8');
  return after !== before;
}
function findFiles(dir, predicate, limit = 2000) {
  const out = [];
  function walk(p) {
    if (out.length >= limit) return;
    for (const name of fs.readdirSync(p)) {
      const full = path.join(p, name);
      const st = fs.lstatSync(full);
      if (st.isDirectory()) walk(full);
      else if (st.isFile() && predicate(full)) out.push(full);
    }
  }
  if (fs.existsSync(dir)) walk(dir);
  return out;
}

const release = path.resolve(arg('release', ''));
const brandDir = path.resolve(arg('brand', 'branding/default'));
if (!release) {
  console.error('Usage: node scripts/apply-brand.cjs --release <built-release-dir> --brand <brand-dir>');
  process.exit(2);
}
ensureFile(path.join(brandDir, 'brand.json'), 'brand.json');
if (!fs.existsSync(release)) throw new Error(`release directory not found: ${release}`);

const brand = readJson(path.join(brandDir, 'brand.json'));
const logoPath = path.join(brandDir, brand.logo || 'logo.svg');
ensureFile(logoPath, 'logo');

const replacements = [
  ['Chongming DSH Starter', brand.name || 'Chongming DSH Starter'],
  ['Chongming', brand.wordmark || brand.name || 'Chongming'],
  ['Bring your own model key. Start local agent work.', brand.headline || 'Bring your own model key. Start local agent work.'],
  ['#2563eb', brand.accentColor || '#2563eb'],
];

const touched = [];
for (const rel of ['README.md', '使用说明.md', 'release-manifest.json']) {
  const file = path.join(release, rel);
  if (replaceInTextFile(file, replacements)) touched.push(rel);
}

const publicBrandDir = path.join(release, 'brand');
fs.mkdirSync(publicBrandDir, { recursive: true });
fs.copyFileSync(logoPath, path.join(publicBrandDir, 'logo.svg'));
touched.push('brand/logo.svg');

const iconName = brand.icon || 'icon.ico';
if (copyIfExists(path.join(brandDir, iconName), path.join(publicBrandDir, 'icon.ico'))) touched.push('brand/icon.ico');

const webAssets = path.join(release, 'dsh', 'node_modules', '@deepseek-ai', 'dsh-web-frontend', 'dist', 'assets');
const candidates = findFiles(webAssets, (p) => /\.(js|mjs)$/.test(p) && fs.statSync(p).size < 2_000_000, 200);
let bundleTouched = 0;
for (const file of candidates) {
  if (replaceInTextFile(file, replacements)) bundleTouched++;
}
if (bundleTouched) touched.push(`web assets text replacements: ${bundleTouched}`);

const manifestPath = path.join(release, 'brand', 'brand.applied.json');
fs.writeFileSync(manifestPath, JSON.stringify({ ...brand, appliedAt: new Date().toISOString(), touched }, null, 2) + '\n');
touched.push('brand/brand.applied.json');

console.log(JSON.stringify({ release, brandDir, brand: brand.name, touched }, null, 2));
