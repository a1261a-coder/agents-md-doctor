#!/usr/bin/env node
import { auditFile, formatMarkdown } from "./doctor.js";

const args = process.argv.slice(2);
const options = {
  json: false,
  strict: false,
  help: false,
  version: false,
  filePath: "AGENTS.md"
};

for (const arg of args) {
  if (arg === "--json") {
    options.json = true;
  } else if (arg === "--strict") {
    options.strict = true;
  } else if (arg === "--help" || arg === "-h") {
    options.help = true;
  } else if (arg === "--version" || arg === "-v") {
    options.version = true;
  } else if (arg.startsWith("-")) {
    console.error(`Unknown option: ${arg}`);
    process.exit(2);
  } else {
    options.filePath = arg;
  }
}

if (options.help) {
  console.log(`agents-md-doctor

Usage:
  agents-md-doctor [options] [AGENTS.md]

Options:
  --json      Print JSON output.
  --strict    Exit non-zero when warnings are found.
  --version   Print package version.
  --help      Print this help.
`);
  process.exit(0);
}

if (options.version) {
  console.log("0.1.0");
  process.exit(0);
}

const report = auditFile(options.filePath);

if (options.json) {
  console.log(JSON.stringify(report, null, 2));
} else {
  process.stdout.write(formatMarkdown(report));
}

if (report.status === "error" || (options.strict && report.status === "warning")) {
  process.exit(1);
}
