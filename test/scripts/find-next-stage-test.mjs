import { expect } from 'chai';
import { execa } from 'execa';

describe('Find next stage', function () {
  it('outputs the next stage based on the stage in the rfc file', async function () {
    let result = await execScript('test/fixtures/1234-what-now.md');
    expect(result.exitCode).to.equal(0);
    expect(result.stdout).to.equal('ready-for-release');
  });

  it('output is empty when at the final stage', async function () {
    let result = await execScript('test/fixtures/0923-already-recommended.md');
    expect(result.exitCode).to.equal(0);
    expect(result.stdout).to.equal('');
  });

  it('fails for an invalid stage in the existing RFC', async function () {
    try {
      await execScript('test/fixtures/1980-invalid-stage.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
      expect(e.stderr).to.equal('Stage my-dreams-will-come-true is not a valid stage');
    }
  });

  it('fails for malformed RFC', async function () {
    try {
      await execScript('test/fixtures/4200-malformed.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
      expect(e.stderr).to.equal(
        '[{"reason":"invalid frontmatter entry","message":"YML parsing error!"}]'
      );
    }
  });

  it('fails for an rfc path that does not exist', async function () {
    try {
      await execScript('does-not-exist.md');
    } catch (e) {
      expect(e.exitCode).to.equal(1);
    }
  });
});

async function execScript(rfcPath) {
  return execa('node', ['scripts/find-next-stage.js', rfcPath]);
}
