const argv = require('yargs').command(
  '* prNumber [paths..]',
  'run check on file names',
  (yargs) => {
    return yargs
      .positional('pr_number', {
        describe: 'The # of the current PR',
        type: 'number',
      })
      .positional('paths', {
        describe: 'file paths to run the lint on',
        type: 'array',
      })
      .demandOption(['paths', 'prNumber']);
  }
).argv;

const ResultReporter = require('./lib/result-reporter');

let results = [];
for (let path of argv.paths) {
  let parts = path.split('/');
  let fileName = parts[parts.length - 1];
  let number = fileName.split('-')[0];
  if (number.length !== 4 || number != argv.prNumber) {
    results.push({
      key: path,
      messages: [`${path} filename must be updated to be prefixed by the PR (ex: 0123-my-rfc.md)`],
    });
  }
}

let reporter = new ResultReporter(results);
reporter.outputDetails();
reporter.outputSummary(
  `No filename mismatches!`,
  `${results.length} RFCs have a filename that does not match the proposal PR #`
);

if (results.length) {
  process.exitCode = 1;
}
