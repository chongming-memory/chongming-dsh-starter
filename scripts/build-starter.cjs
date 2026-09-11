#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function arg(name, fallback) {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

const source = path.resolve(arg('source', ''));
const name = arg('name', 'Chongming-DSH-Starter-local');
const outRoot = path.resolve(arg('out', path.join(process.cwd(), 'output')));
if (!source || !fs.existsSync(source)) {
  console.error('Usage: node scripts/build-starter.cjs --source <existing-dsh-dir> [--name Chongming-DSH-Starter-local] [--out output]');
  process.exit(2);
}

const target = path.join(outRoot, name);
const forbiddenNames = new Set([
  '.git', '.dshcfg', 'sessions', 'attachments', 'storages', 'profiles', 'logs',
  'codexproxy-home', 'llm-deepseek', 'codex', 'device.cred', '.credentials.yaml',
]);
const forbiddenExt = new Set(['.log', '.sqlite', '.db']);

function ensureDir(p) { fs.mkdirSync(p, { recursive: true }); }
function rm(p) { fs.rmSync(p, { recursive: true, force: true }); }
function sha256File(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function shouldSkip(srcPath) {
  const base = path.basename(srcPath);
  if (forbiddenNames.has(base)) return true;
  if (forbiddenExt.has(path.extname(base).toLowerCase())) return true;
  if (/\.sqlite-(wal|shm)$/i.test(base)) return true;
  return false;
}
function copyClean(src, dst) {
  if (shouldSkip(src)) return;
  const st = fs.lstatSync(src);
  if (st.isSymbolicLink()) return;
  if (st.isDirectory()) {
    ensureDir(dst);
    for (const item of fs.readdirSync(src)) copyClean(path.join(src, item), path.join(dst, item));
  } else if (st.isFile()) {
    ensureDir(path.dirname(dst));
    fs.copyFileSync(src, dst);
  }
}

rm(target);
ensureDir(outRoot);
copyClean(source, target);

const templateRoot = path.resolve(__dirname, '..', 'templates');
if (fs.existsSync(templateRoot)) copyClean(templateRoot, path.join(target, 'templates'));

const manifest = {
  name,
  built_at: new Date().toISOString(),
  source_note: 'Built from a local DSH distribution; source path intentionally omitted.',
  no_builtin_keys: true,
  excludes: Array.from(forbiddenNames).sort(),
};
fs.writeFileSync(path.join(target, 'release-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

const manifestHash = sha256File(path.join(target, 'release-manifest.json'));
console.log(JSON.stringify({ output: target, releaseManifestSha256: manifestHash }, null, 2));
