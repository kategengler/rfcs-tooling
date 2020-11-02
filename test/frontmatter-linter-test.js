const describe = require('mocha').describe;
const it = require('mocha').it;
const expect = require('chai').expect;
const FrontmatterLinter = require('../lib/frontmatter-linter');

const defaultMetadataMarkdown = `---
Stage: Proposed
Start Date: 
Release Date: Unreleased
Release Versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
Relevant Team(s): 
RFC PR: 
---`;

const emptyMetadata = `---
---`;

const nonExistentStageMarkdown = `---
Stage: Propsed
Start Date: 2020-01-01 
Release Date: Unreleased
Release Versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
Relevant Team(s): Ember.js 
RFC PR: https://github.com/emberjs/rfcs/pull/123
---`;

const missingReleaseDataMarkdown = `---
Stage: Recommended
Start Date: 2020-01-01
Release Date: Unreleased
Release Versions:
  ember-source: vX.Y.Z
  ember-data: vX.Y.Z
Relevant Team(s): Ember.js
RFC PR: https://github.com/emberjs/rfcs/pull/123/
---`;

const completedMetadataMarkdown = `---
Stage: Recommended
Start Date: 2020-01-01 
Release Date: 2020-04-02 
Release Versions:
  ember-source: v1.1.1
  ember-data: v0.0.3
Relevant Team(s): Ember.js 
RFC PR: https://github.com/emberjs/rfcs/pull/123
---`;

const wrongURLForRFCMetadataMarkdown = `---
Stage: Recommended
Start Date: 2020-01-01 
Release Date: 2020-04-02 
Release Versions:
  ember-source: v1.1.1
  ember-data: v0.0.3
Relevant Team(s): Ember.js 
RFC PR: https://github.com/emberjs/rfcs/pull/123/files
---`;

const cliUrlForRFCMetadataMarkdown = `---
Stage: Recommended
Start Date: 2020-01-01 
Release Date: 2020-04-02 
Release Versions:
  ember-source: v1.1.1
  ember-data: v0.0.3
Relevant Team(s): Ember.js 
RFC PR: https://github.com/ember-cli/rfcs/pull/123
---`;

describe('FrontmatterLinter', function () {
  it('reports errors for empty frontmatter/metadata', function () {
    let errorsForMissingMetadata = [
      'Stage is required',
      'Start Date is required',
      'Relevant Team(s) is required',
      'RFC PR is required',
    ];

    let results = FrontmatterLinter.lint('');
    expect(results.messages).to.deep.eql(errorsForMissingMetadata);

    results = FrontmatterLinter.lint(emptyMetadata);
    expect(results.messages).to.deep.eql(errorsForMissingMetadata);
  });

  it('reports errors for default metadata', function () {
    let results = FrontmatterLinter.lint(defaultMetadataMarkdown);

    expect(results.messages).to.deep.eql([
      'Start Date must be a date formatted YYYY-MM-DD',
      'Relevant Team(s) must be a list of one or more Ember teams',
      'RFC PR must be the URL for the original pull request on emberjs/rfcs, for example: https://github.com/emberjs/rfcs/pull/123',
    ]);
  });

  it('reports errors for non-existent stage', function () {
    let results = FrontmatterLinter.lint(nonExistentStageMarkdown);

    expect(results.messages).to.deep.eql([
      `Stage must be one of the RFC Stages: "Proposed", "Exploring", "Accepted", "Ready for Release", "Released", "Recommended" (See https://github.com/emberjs/rfcs#stages)`,
    ]);
  });

  it('reports errors for Release metadata when released', function () {
    let results = FrontmatterLinter.lint(missingReleaseDataMarkdown);

    expect(results.messages).to.deep.eql([
      'Release Date must be a date formatted YYYY-MM-DD',
      'Release Versions packages must each be set to the version in which the RFC work was released in that package (Should not be default vX.Y.Z, should be removed if irrelevant)',
    ]);
  });

  it('reports errors for incorrect RFC PR URL', function () {
    let results = FrontmatterLinter.lint(wrongURLForRFCMetadataMarkdown);

    expect(results.messages).to.deep.eql([
      'RFC PR must be the URL for the original pull request on emberjs/rfcs, for example: https://github.com/emberjs/rfcs/pull/123',
    ]);
  });

  it('reports NO errors for completed metadata', function () {
    let results = FrontmatterLinter.lint(completedMetadataMarkdown);
    expect(results.messages).to.be.empty;
  });

  it('reports NO errors for completed metadata with CLI RFC URL', function () {
    let results = FrontmatterLinter.lint(cliUrlForRFCMetadataMarkdown);
    expect(results.messages).to.be.empty;
  });
});
