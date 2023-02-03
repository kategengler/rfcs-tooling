import yargs from 'yargs';
import { hideBin } from 'yargs/helpers'
import ResultReporter from '../lib/result-reporter.mjs';

const argv = yargs(hideBin(process.argv)).command('* prNumber path', 'run check on file names', (yargs) => {
  return yargs
    .positional('pr_number', {
      describe: 'The # of the current PR',
      type: 'number',
    })
    .positional('path', {
      describe: 'file path to run the lint on',
      type: 'string',
    })
    .demandOption(['path', 'prNumber']);
}).argv;

let results = [];
let parts = argv.path.split('/');
let fileName = parts[parts.length - 1];
let number = fileName.split('-')[0];
if (number.length !== 4 || number != argv.prNumber) {
  results.push({
    key: argv.path,
    messages: [
      `${argv.path} filename must be updated to be prefixed by the PR (ex: ${argv.prNumber}-my-rfc.md)`,
    ],
  });
}

let reporter = new ResultReporter(results);
reporter.outputDetails();
reporter.outputSummary(
  `No filename mismatches!`,
  `The RFC has a filename that does not match the proposal PR #`
);

if (results.length) {
  process.exitCode = 1;
}
