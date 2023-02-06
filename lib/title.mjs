import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';

function topLevelHeaderText(tree) {
  let heading;

  visit(tree, 'heading', (node) => {
    if (node.depth !== 1) {
      return;
    }
    heading = node;
  });
  return heading;
}

export function title(markdown) {
  const tree = unified().use(remarkParse).use(remarkGfm).use(remarkFrontmatter).parse(markdown);
  const headingTree = topLevelHeaderText(tree);
  return toString(headingTree);
}
