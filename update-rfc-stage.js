const argv = require('yargs').command(
  '* newStage [paths..]',
  'run check on file names',
  (yargs) => {
    return yargs
      .positional('newStage', {
        describe: 'The stage to update the RFC metadata to',
        type: 'string',
      })
      .positional('paths', {
        describe: 'file paths of the RFCs to update',
        type: 'array',
      })
      .demandOption(['paths', 'newStage']);
  }
).argv;

const { readFileSync, writeFileSync } = require('fs');

const Updater = require('./lib/frontmatter-updater');

for (let path of argv.paths) {
  let file = readFileSync(path, 'utf8');
  const updater = new Updater(file);
  let output = updater.updateMetadata({ stage: argv.newStage });
  writeFileSync(path, output);
}
