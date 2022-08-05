const fromMarkdown = require('mdast-util-from-markdown');
const zone = require('mdast-zone')
const toString = require('mdast-util-to-string');
const toMarkdown = require('mdast-util-to-markdown');
const syntax = require('micromark-extension-frontmatter')
const gfm = require('mdast-util-gfm')
const GfmSyntax = require('micromark-extension-gfm')
const frontmatter = require('mdast-util-frontmatter');
const visit = require('unist-util-visit')

module.exports = class MarkdownEditor {
  constructor(markdown) {
    this.markdown = markdown;
  }

  createOrReplaceArea(areaName, newAreaContents) {
    let ast = asAst(this.markdown);
    let search = false;
    zone(ast, areaName, function() {
      search = true;
    })
// does this have a async issue??
    if (search) {
      this.replaceArea(areaName, newAreaContents);
    } else {
      addNodesAfterNodeOfType('yaml', ast, function(nodes) {
        return contentsAsAst(areaName, newAreaContents);
      })
      this.markdown = toMarkdown(ast, { extensions: [frontmatter.toMarkdown(['yaml']), gfm.toMarkdown()] });
    }
  }

  replaceArea(areaName, newAreaContents) {
    let ast = asAst(this.markdown);
    zone(ast, areaName, function(start, nodes, end) {
      return contentsAsAst(areaName, newAreaContents);
    });
    this.markdown = toMarkdown(ast,{ extensions: [frontmatter.toMarkdown(['yaml']), gfm.toMarkdown()]});
  }

  toString() {
    return this.markdown;
  }
}

function contentsAsAst(areaName, contents) {
  const newContentsWithMarkers = `<!--${areaName} start-->\n${contents}\n<!--${areaName} end-->`;
  return asAst(newContentsWithMarkers);
}

function asAst(markdown) {
  return fromMarkdown(markdown, { extensions: [syntax(['yaml']), GfmSyntax()], mdastExtensions: [frontmatter.fromMarkdown(['yaml']), gfm.fromMarkdown]});
}

function addNodesAfterNodeOfType(type, node, callback) {
  visit(node, function (node, index, parent) {
    if (node.type === type) {
      let result = callback(node)
      if (result) {
        parent.children.splice(index + 1, 0, ...result.children)
      }
    }
  });
}