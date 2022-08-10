const argv = require('yargs').command(
  '* baseSha path',
  'determine if an RFC stage has advanced since the baseSha',
  (yargs) => {
    return yargs
      .positional('baseSha', {
        describe: 'The sha to compare against',
        type: 'string',
      })
      .positional('path', {
        describe: 'file path of the RFC to check',
        type: 'string',
      })
      .demandOption(['path', 'baseSha']);
  }
).argv;

const simpleGit = require('simple-git');
const frontmatter = require('@github-docs/frontmatter');
const { readFileSync } = require('fs');

return new Promise((resolve) => {
  const currentMarkdown = readFileSync(argv.path, 'utf8');
  const { data: currentData } = frontmatter(currentMarkdown);
  return simpleGit()
    .show(`${argv.baseSha}:${argv.path}`)
    .then((originalMarkdown) => {
      const { data: originalData } = frontmatter(originalMarkdown);
      if (originalData.stage !== currentData.stage) {
        console.log(
          `Stage in ${argv.path} has changed from ${originalData.stage} to ${currentData.stage} since ${argv.baseSha}`
        );
        process.exitCode = 0;
        return resolve();
      } else {
        console.log(`Stage in ${argv.path} is unchanged since ${argv.baseSha}`);
        process.exitCode = 1;
        return resolve();
      }
    })
    .catch((e) => {
      if (!/exists on disk, but not in/.test(e.message)) {
        console.error(e);
      }
      process.exitCode = 1;
      return resolve();
    });
});
