// Counts the errors strictNullChecks would raise, for the app and the specs, and fails above a limit.
// The flag stays off in tsconfig.json until the count reaches 0; the limit in package.json only goes down.
// Usage: node scripts/check-strict-null.mjs <limit>
import {execFileSync} from 'node:child_process';

const limit = Number(process.argv[2]);
if (!Number.isInteger(limit) || limit < 0) {
  console.error('Usage: node scripts/check-strict-null.mjs <limit>');
  process.exit(2);
}

const errors = new Set();
for (const project of ['src/tsconfig.app.json', 'src/tsconfig.spec.json']) {
  let output = '';
  try {
    output = execFileSync('npx', ['tsc', '--noEmit', '--strictNullChecks', '--pretty', 'false', '-p', project], {encoding: 'utf8'});
  } catch (error) {
    // tsc exits non-zero when it reports errors; the report is on stdout.
    output = error.stdout ?? '';
  }
  for (const line of output.split('\n')) {
    const match = line.match(/^(.+?)\((\d+),(\d+)\): error (TS\d+)/);
    if (match) {
      errors.add(`${match[1]}:${match[2]}:${match[3]} ${match[4]}`);
    }
  }
}

const byFolder = new Map();
for (const error of errors) {
  const parts = error.split(':')[0].split('/');
  const folder = parts.slice(0, parts[1] === 'app' && parts[2] === 'pages' ? 4 : 3).join('/');
  byFolder.set(folder, (byFolder.get(folder) ?? 0) + 1);
}
for (const [folder, count] of [...byFolder].sort((a, b) => b[1] - a[1])) {
  console.log(`${String(count).padStart(5)}  ${folder}`);
}
console.log(`\n${errors.size} strictNullChecks errors (limit ${limit})`);

if (errors.size > limit) {
  console.error(`Too many: fix ${errors.size - limit} or more before committing.`);
  process.exit(1);
}
if (errors.size < limit) {
  console.log(`Below the limit: lower it to ${errors.size} in package.json.`);
}
