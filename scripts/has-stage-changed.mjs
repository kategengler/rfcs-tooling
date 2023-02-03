import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import simpleGit from 'simple-git';
import { readFileSync } from 'node:fs';
import { frontmatter } from '../lib/frontmatter.mjs';

const argv = yargs(hideBin(process.argv)).command(
  '* baseSha path',
  'determine if an RFC stage has advanced since the baseSha',
  (yargs) => {
    return yargs
      .positional('baseSha', {
        describe: 'The sha to compare against',
        type: 'string',
      })
      .positional('path', {
        describe: 'file path of the RFC to check',
        type: 'string',
      })
      .demandOption(['path', 'baseSha']);
  }
).argv;

const currentMarkdown = readFileSync(argv.path, 'utf8');
const { data: currentData } = frontmatter(currentMarkdown);
try {
  const originalMarkdown = await simpleGit().show(`${argv.baseSha}:${argv.path}`)
  const { data: originalData } = frontmatter(originalMarkdown);
  if (originalData.stage !== currentData.stage) {
    console.log(
      `Stage in ${argv.path} has changed from ${originalData.stage} to ${currentData.stage} since ${argv.baseSha}`
    );
    process.exitCode = 0;
  } else {
    console.log(`Stage in ${argv.path} is unchanged since ${argv.baseSha}`);
    process.exitCode = 1;
  }
} catch (e) {
  if (!/exists on disk, but not in/.test(e.message)) {
    console.error(e);
  }
  process.exitCode = 1;
}
