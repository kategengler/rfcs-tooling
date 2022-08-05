const argv = require('yargs').command(
  '* [paths..]',
  'set banner on RFC based on stage',
  (yargs) => {
    return yargs
      .positional('paths', {
        describe: 'rfc paths on which to set the banner based on current stage',
        type: 'array',
      })
      .demandOption(['paths']);
  }
).argv;

const fs = require('fs');
const fromMarkdown = require('mdast-util-from-markdown');
const zone = require('mdast-zone')
// const toMarkdown = require('mdast-util-to-markdown');
// const toString = require('mdast-util-to-string');
// const YAML = require('json-to-pretty-yaml');

for (let path of argv.paths) {
  let file = fs.readFileSync(path, 'utf8');
  let ast = fromMarkdown(file);
  let existingBanner =
  let frontmatterContents = convertListToYaml(metaList);
  let endOfList = metaList.position.end.offset;
  let insertOffset = endOfList || 0;
  let after = file.slice(insertOffset);
  let linebreak = '\n';
  let newContents = `---` + linebreak + frontmatterContents + linebreak + `---` + after;
  fs.writeFileSync(path, newContents, { encoding: 'utf8' });
}
