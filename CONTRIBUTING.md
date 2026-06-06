# Contributing

Thank you for improving `agents-md-doctor`.

## Local Setup

```sh
npm install
npm test
node src/cli.js AGENTS.md
```

The package is intentionally dependency-free. Please avoid adding dependencies
unless they remove clear maintenance risk.

## Adding Rules

Each new rule should include:

- A short rule name
- A clear severity choice: `error` or `warning`
- A focused test that demonstrates the risky input
- A test or fixture that shows acceptable input

Rules should stay heuristic and explainable. Avoid checks that require network
access or model inference.

## Pull Requests

Before opening a pull request:

```sh
npm test
node src/cli.js --strict AGENTS.md
```

Keep changes small. A rule addition, formatter change, or CLI behavior change
should usually be reviewed as a separate pull request.
