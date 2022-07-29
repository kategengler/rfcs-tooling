const frontmatter = require('@github-docs/frontmatter');
const semver = require('semver');
const { readdirSync } = require('fs');

const stages = readdirSync('./stages').map((filename) => filename.replace(/\.md$/, ''));
const teams = readdirSync('./teams').map((filename) => filename.replace(/\.md$/, ''));

const releasedOrLaterStages = ['released', 'recommended'];

const rules = {
  stage: {
    type: 'string',
    required: true,
    enum: stages,
    messages: {
      enum: `must be one of the RFC Stages: "${stages.join(
        '", "'
      )}" (See https://github.com/emberjs/rfcs#stages)`,
    },
  },
  'start-date': {
    type: 'date',
    required: true,
    allowEmpty: false,
    messages: {
      type: 'must be a date formatted YYYY-MM-DD',
    },
  },
  teams: {
    required: true,
    conform: function (value) {
      if (!value) {
        // it's ok for teams to be empty
        return true;
      }
      const result = value?.every((item) => teams.includes(item));
      // we need to warn like this because revalidator doesn't allow custom messages
      if (!result) {
        console.warn(`Invalid team in ${value}. Available teams: ${teams}`);
      }
      return result;
    },
    messages: {
      conform: `must only include any number of: ${teams}`,
    },
  },
  'proposal-pr': {
    required: true,
    allowEmpty: false,
    conform(url) {
      let regex = /https:\/\/github.com\/emberjs\/rfcs\/pull\/\d+(\/|$)$/;
      let cli = /https:\/\/github.com\/ember-cli\/rfcs\/pull\/\d+(\/|$)$/;
      return regex.test(url) || cli.test(url);
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

const defaultSchema = withRules(['stage', 'start-date', 'teams', 'proposal-pr']);
const releasedOrLaterSchema = withRules([
  'stage',
  'start-date',
  'teams',
  'proposal-pr',
  'Release Date',
  'Release Versions',
]);

module.exports = class FrontmatterLinter {
  static lint(markdown) {
    const { data } = frontmatter(markdown);
    const schema = chooseSchema(data);
    return this.lintWithSchema(markdown, schema);
  }

  static lintWithSchema(markdown, schema) {
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
