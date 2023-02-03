import { expect } from 'chai';
import { execa } from 'execa';

describe('rfc-frontmatter', function () {
  it('outputs the frontmatter of given RFCs as JSON', async function () {
    let result = await execScript('test/fixtures/1234-what-now.md');
    expect(result.exitCode).to.equal(0);
    expect(JSON.parse(result.stdout)).to.eql({
      stage: 'accepted',
      'start-date': '2022-08-28T00:00:00.000Z',
      'release-date': 'Unreleased',
      'release-versions': null,
      'ember-source': 'vX.Y.Z',
      'ember-data': 'vX.Y.Z',
      teams: ['framework'],
      prs: {
        accepted: null,
      },
    });
  });

  it('fails if any of the RFCs have errors', async function () {
    try {
      await execScript('test/fixtures/4200-malformed.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
    }
  });
});

async function execScript(path) {
  return execa('node', ['scripts/rfc-frontmatter.mjs', path]);
}
