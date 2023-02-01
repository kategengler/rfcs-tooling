const argv = require('yargs').command(
  '* path stage prUrl',
  'update advancement PR in frontmatter',
  (yargs) => {
    return yargs
      .positional('path', {
        describe: 'file path of the RFC to update',
        type: 'string',
      })
      .positional('stage', {
        describe: 'the stage for advancement',
        type: 'string',
      })
      .positional('prUrl', {
        describe: 'the url of PR for advancement',
        type: 'string',
      })
      .demandOption(['path', 'stage', 'prUrl']);
  }
).argv;

const { readFileSync, writeFileSync } = require('fs');

const Updater = require('../lib/frontmatter-updater');

let path = argv.path;
let file = readFileSync(path, 'utf8');
const updater = new Updater(file);
let output = updater.updateMetadata({ prs: { [argv.stage]: argv.prUrl } });
writeFileSync(path, output);
