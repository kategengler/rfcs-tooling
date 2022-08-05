const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const MarkdownEditor = require('../lib/markdown-editor');

const rfcContents = `---
Stage: Accepted
Start Date: 2020-01-01
Release Date: Unreleased
Release Versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
Relevant Team(s): Ember.js
RFC PR: https://github.com/emberjs/rfcs/pull/123/
---

<!--banner start -->
  Foo bar baz
<!--banner end -->

# RFC for Stuff

Things and places
`;

const rfcContentsNoBanner = `---
Stage: Accepted
Start Date: 2020-01-01
Release Date: Unreleased
Release Versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
Relevant Team(s): Ember.js
RFC PR: https://github.com/emberjs/rfcs/pull/123/
---

# RFC for Stuff

Things and places
`;

const expectedRfcContents = `---
Stage: Accepted
Start Date: 2020-01-01
Release Date: Unreleased
Release Versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
Relevant Team(s): Ember.js
RFC PR: https://github.com/emberjs/rfcs/pull/123/
---

<!--banner start-->

Bang bop boop

<!--banner end-->

# RFC for Stuff

Things and places
`;

describe('MarkdownEditor', function () {
  it('replaces the zone if needed', function () {
    let editor = new MarkdownEditor(rfcContents);
    editor.createOrReplaceArea('banner', 'Bang bop boop')
    let results = editor.toString();
    expect(results).to.eql(expectedRfcContents);
  });

  it('adds the zone if needed', function () {
    let editor = new MarkdownEditor(rfcContentsNoBanner);
    editor.createOrReplaceArea('banner', 'Bang bop boop')
    let results = editor.toString();
    expect(results).to.eql(expectedRfcContents);
  });
});
