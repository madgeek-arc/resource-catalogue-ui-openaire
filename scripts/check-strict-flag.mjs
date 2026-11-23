// Counts the errors a strict compiler flag would raise, for the app and the specs, in TypeScript and in templates
// (ngc checks both, as strictTemplates is on), and fails above a limit.
// The flag stays off in tsconfig.json until the count reaches 0; the limit in package.json only goes down.
// Usage: node scripts/check-strict-flag.mjs <flag> <limit>, e.g. node scripts/check-strict-flag.mjs noImplicitAny 37
import {execFileSync} from 'node:child_process';

const [flag, limitArg] = process.argv.slice(2);
const limit = Number(limitArg);
if (!/^[a-zA-Z]+$/.test(flag ?? '') || !Number.isInteger(limit) || limit < 0) {
  console.error('Usage: node scripts/check-strict-flag.mjs <flag> <limit>');
  process.exit(2);
}

const errors = new Set();
for (const project of ['src/tsconfig.app.json', 'src/tsconfig.spec.json']) {
  let output = '';
  try {
    output = execFileSync('npx', ['ngc', '--noEmit', `--${flag}`, '-p', project], {encoding: 'utf8', stdio: 'pipe'});
  } catch (error) {
    // ngc exits non-zero when it reports errors; the report is on stdout and stderr.
    output = (error.stdout ?? '') + (error.stderr ?? '');
  }
  // ngc colours its report and prints paths relative to src/: "app/x.html:12:3 - error TS7006: ...".
  for (const line of output.replace(/\x1b\[[0-9;]*m/g, '').split('\n')) {
    const match = line.match(/^(\S+?):(\d+):(\d+) - error ((?:TS|NG)\d+)/);
    if (match) {
      errors.add(`src/${match[1]}:${match[2]}:${match[3]} ${match[4]}`);
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
console.log(`\n${errors.size} ${flag} errors (limit ${limit})`);

if (errors.size > limit) {
  console.error(`Too many: fix ${errors.size - limit} or more before committing.`);
  process.exit(1);
}
if (errors.size < limit) {
  console.log(`Below the limit: lower it to ${errors.size} in package.json.`);
}
