const chalk = require('chalk');

function log() {
  console.log(...arguments);
}

module.exports = class ResultReporter {
  constructor(results) {
    this.results = results;
  }

  outputDetails() {
    this.results.forEach(({ key, messages }) => {
      log(chalk.bold(key));
      messages.forEach((message) => {
        log('  ', chalk.red('error'), ` ${message}`);
      });

      log(`\n`);
    });
  }

  outputSummary(successMessage, failureMessage) {
    if (this.results.length) {
      log(chalk.red(failureMessage));
    } else {
      log(chalk.green(successMessage));
    }
  }
};
