const argv = require('yargs').command('* [paths..]', 'run lint on files', (yargs) => {
  return yargs
    .positional('paths', {
      describe: 'file paths to run the lint on',
      type: 'array',
    })
    .demandOption('paths');
}).argv;

const Linter = require('../lib/frontmatter-linter');
const { readFileSync, readdirSync } = require('fs');
const ResultReporter = require('../lib/result-reporter');

const stages = readdirSync('./stages').map((filename) => filename.replace(/\.md$/, ''));
const teams = readdirSync('./teams').map((filename) => filename.replace(/\.md$/, ''));

const linter = new Linter(stages, teams);

let results = [];
for (let path of argv.paths) {
  let file = readFileSync(path, 'utf8');
  let { messages } = linter.lint(file);
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
