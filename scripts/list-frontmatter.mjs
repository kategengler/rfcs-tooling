import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'node:fs';
import { frontmatter } from '../lib/frontmatter.mjs';

const argv = yargs(hideBin(process.argv)).command(
  '* [paths..]',
  'list frontmatter from files',
  (yargs) => {
    return yargs
      .positional('paths', {
        describe: 'file paths to list frontmatter from',
        type: 'array',
      })
      .demandOption('paths');
  }
).argv;

let results = [];
for (let path of argv.paths) {
  let markdown = readFileSync(path, 'utf8');
  const { data, errors } = frontmatter(markdown);
  if (errors.length) {
    console.error(JSON.stringify(errors));
    process.exitCode = 1;
  } else {
    results.push({ name: path, ...data });
  }
}

console.log(JSON.stringify(results, null, 2));
