const frontmatter = require('@github-docs/frontmatter');
const semver = require('semver');

const stages = [
  'Proposed',
  'Exploring',
  'Accepted',
  'Ready for Release',
  'Released',
  'Recommended',
];

const releasedOrLaterStages = ['Released', 'Recommended'];

const rules = {
  Stage: {
    type: 'string',
    required: true,
    enum: stages,
    messages: {
      enum: `must be one of the RFC Stages: "${stages.join(
        '", "'
      )}" (See https://github.com/emberjs/rfcs#stages)`,
    },
  },
  'Start Date': {
    type: 'date',
    required: true,
    allowEmpty: false,
    messages: {
      type: 'must be a date formatted YYYY-MM-DD',
    },
  },
  'Relevant Team(s)': {
    type: 'string',
    required: true,
    allowEmpty: false,
    messages: {
      type: 'must be a list of one or more Ember teams',
    },
  },
  'RFC PR': {
    required: true,
    allowEmpty: false,
    conform(url) {
      let regex = /https:\/\/github.com\/emberjs\/rfcs\/pull\/\d+(\/|$)$/;
      return regex.test(url);
    },
    messages: {
      conform:
        'must be the URL for the original pull request on emberjs/rfcs, for example: https://github.com/emberjs/rfcs/pull/123',
    },
  },
  'Release Date': {
    type: 'date',
    required: true,
    allowEmpty: false,
    messages: {
      type: 'must be a date formatted YYYY-MM-DD',
    },
  },
  'Release Versions': {
    type: 'object',
    required: true,
    allowEmpty: true,
    conform(packages) {
      for (const package in packages) {
        if (!semver.valid(packages[package])) {
          return false;
        }
      }
      return true;
    },
    messages: {
      conform:
        'packages must each be set to the version in which the RFC work was released in that package (Should not be default vX.Y.Z, should be removed if irrelevant)',
    },
  },
};

const defaultSchema = withRules(['Stage', 'Start Date', 'Relevant Team(s)', 'RFC PR']);
const releasedOrLaterSchema = withRules([
  'Stage',
  'Start Date',
  'Relevant Team(s)',
  'RFC PR',
  'Release Date',
  'Release Versions',
]);

module.exports = class FrontmatterLinter {
  static lint(markdown) {
    const { data } = frontmatter(markdown);
    const schema = chooseSchema(data);
    const { errors } = frontmatter(markdown, { schema });
    return { messages: formatErrors(errors) };
  }
};

function chooseSchema(data) {
  if (releasedOrLaterStages.includes(data['Stage'])) {
    return releasedOrLaterSchema;
  }
  return defaultSchema;
}

function formatErrors(errors) {
  return errors.map((e) => {
    return `${e.property} ${e.message}`;
  });
}

function withRules(ruleNames) {
  let props = {};
  ruleNames.forEach((rule) => {
    props[rule] = rules[rule];
  });
  return { properties: props };
}
