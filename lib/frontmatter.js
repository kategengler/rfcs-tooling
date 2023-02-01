const githubFrontmatter = require('@github-docs/frontmatter');

module.exports = function frontmatter(markdown) {
  let { content, data, errors } = githubFrontmatter(markdown);
  return { content, data, errors };
};
