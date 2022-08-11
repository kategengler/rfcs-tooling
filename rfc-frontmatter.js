const argv = require('yargs').command(
  '* path',
  'return the frontmatter of the RFC as JSON',
  (yargs) => {
    return yargs
      .positional('path', {
        describe: 'file path of the RFC',
        type: 'string',
      })
      .demandOption(['path']);
  }
).argv;

const frontmatter = require('@github-docs/frontmatter');
const { readFileSync } = require('fs');

let markdown = readFileSync(argv.path, 'utf8');
const { data, errors } = frontmatter(markdown);

if (errors.length) {
  console.error(JSON.stringify(errors));
  process.exitCode = 1;
  return;
}

console.log(JSON.stringify(data));
