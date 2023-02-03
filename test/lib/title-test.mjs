import chai from 'chai';
import { title } from '../../lib/title.mjs';

const expect = chai.expect;

const RFC = `---
stage: accepted
start-date: 2022-08-28
release-date: Unreleased
release-versions:
ember-source: vX.Y.Z
ember-data: vX.Y.Z
teams:
  - framework
prs:
  accepted:
---

# My New RFC

My grand plans...

## Another heading

some stuff we will do
`

const RfcWithBlocksInHeader = `---
stage: accepted
start-date: 2022-08-28
release-date: Unreleased
release-versions:
ember-source: vX.Y.Z
ember-data: vX.Y.Z
teams:
  - framework
prs:
  accepted:
---

# Deprecate \`foo\` and \`bar\`; immediately
## Another heading
`


describe('title', function() {
  it('returns the contents of the first top-level header in the doc', async function() {
    let header = title(RFC);
    expect(header).to.equal('My New RFC');
  });

  it('returns the text contents of the first top-level header in the doc when there are blocks', async function() {
    let header = title(RfcWithBlocksInHeader);
    expect(header).to.equal('Deprecate foo and bar; immediately');
  });
});
