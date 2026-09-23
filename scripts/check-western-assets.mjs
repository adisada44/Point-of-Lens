import {statSync} from 'node:fs';
import {requiredCoreAssets} from '../src/westernAssets.ts';

// Resolve from this script so the report also works outside the project directory.
const assetDirectory = new URL('../public/assets/western/views/', import.meta.url);
// The medium anchor is shared by all three groups; roll needs no separate image.
const requiredFiles = requiredCoreAssets.map(asset => asset.filename);
let present = 0;

console.log('V1 CORE Western assets — public/assets/western/views/\n');
for (const filename of requiredFiles) {
  const exists = statSync(new URL(filename, assetDirectory), {throwIfNoEntry: false})?.isFile() ?? false;
  if (exists) present++;
  console.log(`${exists ? '✓' : '✗'} ${filename}`);
}
console.log(`\n${present}/${requiredFiles.length} present · ${requiredFiles.length - present} missing`);
