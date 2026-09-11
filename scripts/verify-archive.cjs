#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const target = process.argv[2];
if (!target || !fs.existsSync(target)) {
  console.error('Usage: node scripts/verify-archive.cjs <file.zip-or-release-file>');
  process.exit(2);
}
const hash = crypto.createHash('sha256').update(fs.readFileSync(target)).digest('hex');
console.log(`${hash}  ${path.basename(target)}`);
