import frontmatter from '@github-docs/frontmatter';
import merge from 'deepmerge';

export default class FrontmatterUpdater {
  constructor(markdown) {
    this.markdown = markdown;
  }

  updateMetadata(metadata) {
    const { data, content, errors } = frontmatter(this.markdown);
    if (errors.length) {
      throw new Error(`Could not parse frontmatter: ${JSON.stringify(errors)}`);
    }

    let frontmatterContent = frontmatter
      .stringify('', merge(data, metadata, { arrayMerge: unionMerge }))
      .replaceAll(': null', ':')
      .trim();

    return [frontmatterContent, content].join('\n');
  }
};

function unionMerge(target, source) {
  const combined = [...target, ...source];
  return [...new Set(combined)];
}
