import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const commitHash = execFileSync('git', ['rev-parse', 'HEAD'], {
  encoding: 'utf8',
}).trim();
const shortCommit = commitHash.slice(0, 12);
const shortTimestamp = Date.now().toString(36);
const buildId = `${shortCommit}-${shortTimestamp}`;
const serverOutputPath = resolve('dist/server');

mkdirSync(serverOutputPath, { recursive: true });
writeFileSync(resolve(serverOutputPath, 'build_id.txt'), `${buildId}\n`);

console.log(`Build ID: ${buildId}`);
