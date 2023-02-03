import chai from 'chai';
import FrontmatterUpdater from '../../lib/frontmatter-updater.mjs';
const expect = chai.expect;

const baseMarkdown = `---
stage: accepted
start-date:
release-date: Unreleased
release-versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
teams:
  - framework
prs:
  accepted:
---
# My RFC

## My heading

Foo bar baz null
`;

const readyForReleaseMarkdown = `---
stage: ready-for-release
start-date:
release-date: Unreleased
release-versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
teams:
  - framework
prs:
  accepted:
---
# My RFC

## My heading

Foo bar baz null
`;

const updatedDeepKeysMarkdown = `---
stage: ready-for-release
start-date:
release-date: Unreleased
release-versions:
  ember-source: v1.2.3
  ember-data: v4.5.6
  ember-cli: v7.8.9
teams:
  - framework
  - ember-data
prs:
  accepted:
  ready-for-release: 'https:://github.com/emberjs/rfcs/pull/001'
---
# My RFC

## My heading

Foo bar baz null
`;

describe('FrontmatterUpdater', function () {
  it('updates the frontmatter based on metadata passed', function () {
    let updater = new FrontmatterUpdater(baseMarkdown);
    let output = updater.updateMetadata({ stage: 'ready-for-release' });
    expect(output).to.eql(readyForReleaseMarkdown);
  });

  it('updates the frontmatter when deep values are included', function () {
    let updater = new FrontmatterUpdater(readyForReleaseMarkdown);
    let output = updater.updateMetadata({
      'release-versions': {
        'ember-source': 'v1.2.3',
        'ember-data': 'v4.5.6',
        'ember-cli': 'v7.8.9',
      },
      prs: {
        'ready-for-release': 'https:://github.com/emberjs/rfcs/pull/001',
      },
      teams: ['framework', 'ember-data'],
    });
    expect(output).to.eql(updatedDeepKeysMarkdown);
  });
});
