const argv = require('yargs').command('* [paths..]', 'run lint on files', (yargs) => {
  return yargs
    .positional('paths', {
      describe: 'file paths to run the lint on',
      type: 'array',
    })
    .demandOption('paths');
}).argv;

const Linter = require('./lib/frontmatter-linter');
const fs = require('fs');
const ResultReporter = require('./lib/result-reporter');

let results = [];
for (let path of argv.paths) {
  let file = fs.readFileSync(path, 'utf8');
  let { messages } = Linter.lint(file);
  if (messages.length) {
    results.push({ key: path, messages });
  }
}

let reporter = new ResultReporter(results);
reporter.outputDetails();
reporter.outputSummary(
  `No RFC frontmatter errors!`,
  `${results.length} RFCs have frontmatter errors`
);

if (results.length) {
  process.exitCode = 1;
}
