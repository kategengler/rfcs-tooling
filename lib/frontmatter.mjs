import githubFrontmatter from '@github-docs/frontmatter';

export function frontmatter(markdown) {
  let { content, data, errors } = githubFrontmatter(markdown);
  return { content, data, errors };
}
