const frontmatter = require('@github-docs/frontmatter');
const { readFileSync } = require('fs');

const argv = require('yargs').command(
  '* labels [paths..]',
  'run check on file names',
  (yargs) => {
    return yargs
      .positional('labels', {
        describe: 'The labels for the current PR',
        type: 'string',
      })
      .positional('paths', {
        describe: 'file paths to run the lint on',
        type: 'array',
      })
      .demandOption(['paths', 'labels']);
  }
).argv;

const ResultReporter = require('./lib/result-reporter');

const STAGE_LABELS = {
  proposed: "S-Proposed",
  exploring: "S-Exploring",
  accepted: "S-Accepted",
  "ready-for-release": "S-Ready for Release",
  released: "S-Released",
  recommended: "S-Recommended"
};

const ADDITIONAL_ALLOWED_LABELS = {
  // New PRs may be created in accepted stage before being merged.
  accepted: ["S-Proposed", "S-Exploring"]
};

const ROOTDIR = process.env.ROOTDIR;

let labels = argv.labels.split(',');

let results = [];
for (let path of argv.paths) {
  let fileResults = [];

  let file = readFileSync(`${ROOTDIR}/${path}`, 'utf8');
  let { data, errors } = frontmatter(file, { filepath: path });

  if (errors.length > 0) {
    fileResults.push(...errors.map((e) => `${e.property} ${e.message}`));
  }

  if (data) {
    let stage = data['stage'];
    if (stage in STAGE_LABELS) {
      let validLabels = [STAGE_LABELS[stage]];
      if (stage in ADDITIONAL_ALLOWED_LABELS) {
        validLabels.push(...ADDITIONAL_ALLOWED_LABELS[stage]);
      }

      let matchedLabel;

      for (let label of validLabels) {
        if (labels.includes(label)) {
          matchedLabel = label;
          break;
        }
      }

      if (matchedLabel) {
        let invalidLabels = Object.values(STAGE_LABELS).filter(l => l !== matchedLabel);
        for (let label of invalidLabels) {
          if (labels.includes(label)) {
            fileResults.push(`'${label}' label does not match stage in frontmatter or more than one label was specified`);
          }
        }
      } else {
        fileResults.push(`Expected presence of a label matching match stage in frontmatter. Valid labels: ${JSON.stringify(validLabels)}. Found: ${JSON.stringify(labels)}`);
      }
    } else {
      fileResults.push(`Invalid stage: ${stage}`);
    }
  }

  if (fileResults.length > 0) {
    results.push({
      key: path,
      messages: fileResults,
    });
  }
}

let reporter = new ResultReporter(results);
reporter.outputDetails();
reporter.outputSummary(
  `Labels match stage!`,
  `${results.length} RFCs have a stage that doesn't match the label`
);

if (results.length) {
  process.exitCode = 1;
}
