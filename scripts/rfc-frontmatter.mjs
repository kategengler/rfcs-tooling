import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import { frontmatter } from '../lib/frontmatter.mjs';
import { readFileSync } from 'node:fs';

const argv = yargs(hideBin(process.argv)).command(
  '* path',
  'return the frontmatter of the RFC as JSON',
  (yargs) => {
    return yargs
      .positional('path', {
        describe: 'file path of the RFC',
        type: 'string',
      })
      .demandOption(['path']);
  }
).argv;


let markdown = readFileSync(argv.path, 'utf8');
const { data, errors } = frontmatter(markdown);

if (errors.length) {
  console.error(JSON.stringify(errors));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(data));
}
