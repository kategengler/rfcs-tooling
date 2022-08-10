const frontmatter = require('@github-docs/frontmatter');
const merge = require('deepmerge');

module.exports = class FrontmatterUpdater {
  constructor(markdown) {
    this.markdown = markdown;
  }

  updateMetadata(metadata) {
    const { data, content, errors } = frontmatter(this.markdown);
    if (errors.length) {
      throw new Error(`Could not parse frontmatter: ${JSON.stringify(errors)}`);
    }

    let output = frontmatter.stringify(content, merge(data, metadata, { arrayMerge: unionMerge }));
    return output.replaceAll(' null', '');
  }
};

function unionMerge(target, source) {
  const combined = [...target, ...source];
  return [...new Set(combined)];
}
