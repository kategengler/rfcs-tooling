import { expect } from 'chai';
import { execa } from 'execa';

describe('list-frontmatter', function () {
  it('outputs the frontmatter of given RFCs as JSON', async function () {
    let result = await execScript([
      'test/fixtures/1234-what-now.md',
      'test/fixtures/0923-already-recommended.md',
    ]);
    expect(result.exitCode).to.equal(0);
    expect(JSON.parse(result.stdout)).to.eql([
      {
        name: 'test/fixtures/1234-what-now.md',
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
        title: "My New RFC"
      },
      {
        name: 'test/fixtures/0923-already-recommended.md',
        stage: 'recommended',
        'start-date': '2022-08-28T00:00:00.000Z',
        'release-date': '2022-12-02T00:00:00.000Z',
        'release-versions': {
          'ember-source': 'v3.3.3',
        },
        teams: ['framework'],
        prs: {
          accepted: null,
        },
        title: "My Completely finished RFC"
      },
    ]);
  });

  it('fails if any of the RFCs have errors', async function () {
    try {
      await execScript('test/fixtures/1234-what-now.md', 'test/fixtures/4200-malformed.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
    }
  });
});

async function execScript(paths) {
  return execa('node', ['scripts/list-frontmatter.mjs', ...paths]);
}
