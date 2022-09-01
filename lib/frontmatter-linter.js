const frontmatter = require('@github-docs/frontmatter');
const semver = require('semver');

const releasedOrLaterStages = ['released', 'recommended'];

module.exports = class FrontmatterLinter {
  constructor(stages = [], teams = []) {
    this.rules = {
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
        type: 'array',
        required: true,
        conform: function (value) {
          const result = value?.every((item) => teams.includes(item));
          // we need to warn like this because revalidator doesn't allow you to use specific
          // context in custom messages. i.e. it will tell you that there an unmatched team
          // but it won't tell you which one is the offending team.
          if (!result) {
            console.warn(`Invalid team in ${value}. Available teams: ${teams}`);
          }
          return result;
        },
        messages: {
          conform: `must only include any number of: ${teams}`,
          type: 'must be a list of one or more Ember teams',
        },
      },
      prs: {
        type: 'object',
        required: true,
        properties: {
          accepted: {
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
        },
      },
      'release-date': {
        type: ['date', 'null'],
        required: true,
        messages: {
          type: 'must be a date formatted YYYY-MM-DD',
        },
      },
      'release-versions': {
        type: ['object', 'null'],
        required: true,
        conform(packages) {
          for (const p in packages) {
            if (!semver.valid(packages[p])) {
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

    this.defaultSchema = this.withRules(['stage', 'start-date', 'teams', 'prs']);
    this.releasedOrLaterSchema = this.withRules([
      'stage',
      'start-date',
      'teams',
      'prs',
      'release-date',
      'release-versions',
    ]);
  }

  lint(markdown) {
    const { data, errors } = frontmatter(markdown);
    if (errors.length) {
      return { messages: errors.map((error) => `${error.message} - ${error.reason}`) };
    }
    const schema = this.chooseSchema(data);
    return this.lintWithSchema(markdown, schema);
  }

  lintWithSchema(markdown, schema) {
    const { errors } = frontmatter(markdown, { schema });
    return { messages: formatErrors(errors) };
  }

  withRules(ruleNames) {
    let props = {};
    ruleNames.forEach((rule) => {
      props[rule] = this.rules[rule];
    });
    return { properties: props };
  }

  chooseSchema(data) {
    if (releasedOrLaterStages.includes(data['stage'])) {
      return this.releasedOrLaterSchema;
    }
    return this.defaultSchema;
  }
};

function formatErrors(errors) {
  return errors.map((e) => {
    return `${e.property} ${e.message}`;
  });
}
