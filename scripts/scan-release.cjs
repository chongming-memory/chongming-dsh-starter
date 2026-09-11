#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.resolve(process.argv[2] || 'output/Chongming-DSH-Starter-local');
const problems = [];
const forbiddenPath = /(^|[\\/])(\.dshcfg|sessions|attachments|storages|profiles|logs|codexproxy-home|llm-deepseek|codex)([\\/]|$)/i;
const forbiddenFile = /(^|[\\/])(\.credentials\.yaml|device\.cred|role-map\.json|hub-base\.env)$/i;
const secretText = /(sk-[A-Za-z0-9_-]{20,}|DEEPSEEK_API_KEY:\s*['"]?[A-Za-z0-9_-]{10,}|ZHIPU_API_KEY:\s*['"]?[A-Za-z0-9_-]{10,}|OPENROUTER_API_KEY:\s*['"]?[A-Za-z0-9_-]{10,}|API2D_API_KEY:\s*['"]?[A-Za-z0-9_-]{10,}|app_secret|refresh_token|access_token|device_token)/i;

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (name === '.git') continue;
    const p = path.join(dir, name);
    const rel = path.relative(root, p);
    const st = fs.lstatSync(p);
    if (st.isSymbolicLink()) problems.push({ type: 'symlink', path: rel });
    if (forbiddenPath.test(rel) || forbiddenFile.test(rel)) problems.push({ type: 'forbidden_path', path: rel });
    if (st.isDirectory()) walk(p);
    else if (st.isFile() && st.size <= 2_000_000) {
      if (rel.split(path.sep).join('/') === 'scripts/scan-release.cjs') continue;
      const text = fs.readFileSync(p, 'utf8');
      if (secretText.test(text)) problems.push({ type: 'possible_secret', path: rel });
    }
  }
}

if (!fs.existsSync(root)) {
  console.error(`release directory not found: ${root}`);
  process.exit(2);
}
walk(root);
console.log(JSON.stringify({ root, status: problems.length ? 'FAIL' : 'PASS', problems }, null, 2));
process.exit(problems.length ? 1 : 0);



