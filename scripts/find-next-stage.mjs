import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync } from 'node:fs';
import { frontmatter } from '../lib/frontmatter.mjs';

const argv = yargs(hideBin(process.argv)).command(
  '* path',
  'find the next stage for an RFC',
  (yargs) => {
    return yargs
      .positional('path', {
        describe: 'file path of the RFC to check',
        type: 'string',
      })
      .demandOption(['path']);
  }
).argv;

function main() {
  const MergedStages = ['accepted', 'ready-for-release', 'released', 'recommended'];
  let markdown = readFileSync(argv.path, 'utf8');
  const { data, errors } = frontmatter(markdown);

  if (errors.length) {
    console.error(JSON.stringify(errors));
    process.exitCode = 1;
    return;
  }

  let stage = data.stage;
  let stageIndex = MergedStages.indexOf(stage);
  if (stageIndex === -1) {
    console.error(`Stage ${stage} is not a valid stage`);
    process.exitCode = 1;
    return;
  }
  let nextStage = MergedStages[stageIndex + 1];
  if (nextStage) {
    console.log(nextStage);
  }
}

main();
