import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { readFileSync, writeFileSync } from 'node:fs';
import Updater from '../lib/frontmatter-updater.mjs';

const argv = yargs(hideBin(process.argv)).command(
  '* newStage [paths..]',
  'update stage in frontmatter',
  (yargs) => {
    return yargs
      .positional('newStage', {
        describe: 'The stage to update the RFC frontmatter to',
        type: 'string',
      })
      .positional('paths', {
        describe: 'file paths of the RFCs to update',
        type: 'array',
      })
      .demandOption(['paths', 'newStage']);
  }
).argv;

for (let path of argv.paths) {
  let file = readFileSync(path, 'utf8');
  const updater = new Updater(file);
  let output = updater.updateMetadata({ stage: argv.newStage });
  writeFileSync(path, output);
}
