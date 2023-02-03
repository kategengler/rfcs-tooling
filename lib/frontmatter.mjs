import githubFrontmatter from '@github-docs/frontmatter';
import { title } from './title.mjs';

export function frontmatter(markdown) {
  let { content, data, errors } = githubFrontmatter(markdown);
  return { content, data: { title: title(markdown), ...data }, errors };
}
