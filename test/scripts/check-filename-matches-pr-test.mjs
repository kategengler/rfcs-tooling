import { expect } from 'chai';
import { execa } from 'execa';

describe('Check filename matches PR', function () {
  it('succeeds for a filename that starts with the provided number', async function () {
    let result = await execScript('1234', 'tests/fixtures/1234-what-now.md');
    expect(result.exitCode).to.equal(0);
    expect(result.stdout).to.equal('No filename mismatches!');
  });

  it('fails for a filename that does not start with the provided number', async function () {
    try {
      await execScript('9876', 'tests/fixtures/1234-what-now.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
      expect(e.stdout).to.match(
        /.*tests\/fixtures\/1234-what-now\.md filename must be updated to be prefixed by the PR \(ex: 9876-my-rfc\.md\).*/
      );
    }
  });

  it('errors for a filename that does not include a number', async function () {
    try {
      await execScript('5673', 'tests/fixtures/my-new-rfc.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
      expect(e.stdout).to.match(
        /.*tests\/fixtures\/my-new-rfc\.md filename must be updated to be prefixed by the PR \(ex: 5673-my-rfc\.md\).*/
      );
    }
  });
});

async function execScript(prNumber, rfcFilename) {
  return execa('node', ['scripts/check-filename-matches-pr.js', prNumber, rfcFilename]);
}
