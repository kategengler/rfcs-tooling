const argv = require('yargs').command('* [paths..]', 'list frontmatter from files', (yargs) => {
  return yargs
    .positional('paths', {
      describe: 'file paths to list frontmatter from',
      type: 'array',
    })
    .demandOption('paths');
}).argv;

const frontmatter = require('../lib/frontmatter.js');
const { readFileSync } = require('fs');

let results = [];
for (let path of argv.paths) {
  let markdown = readFileSync(path, 'utf8');
  const { data, errors } = frontmatter(markdown);
  if (errors.length) {
    console.error(JSON.stringify(errors));
    process.exitCode = 1;
    return;
  }
  results.push({ name: path, ...data });
}

console.log(JSON.stringify(results, null, 2));
