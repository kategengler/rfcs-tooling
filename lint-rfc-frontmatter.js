const argv = require('yargs').command('* [paths..]', 'run lint on files', (yargs) => {
  return yargs
    .positional('paths', {
      describe: 'file paths to run the lint on',
      type: 'array',
    })
    .demandOption('paths');
}).argv;

const linter = require('./lib/frontmatter-linter');
const fs = require('fs');
const chalk = require('chalk');

let results = [];
for (let path of argv.paths) {
  let file = fs.readFileSync(path, 'utf8');
  let { messages } = linter.lint(file);
  if (messages.length) {
    results.push({ path, messages });
  }
}

function log() {
  console.log(...arguments);
}

results.forEach(({ path, messages }) => {
  log(chalk.bold(path));
  messages.forEach((message) => {
    log('  ', chalk.red('error'), ` ${message}`);
  });

  log(`\n`);
});

if (results.length) {
  log(chalk.red(`${results.length} RFCs have frontmatter errors`));
  process.exitCode = 1;
} else {
  log(chalk.green(`No RFC frontmatter errors!`));
}
