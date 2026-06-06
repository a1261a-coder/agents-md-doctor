import assert from "node:assert/strict";
import test from "node:test";
import { auditText, formatMarkdown } from "../src/doctor.js";

test("reports ok for a concise instruction file", () => {
  const report = auditText(`Use small, focused changes.
Ask for confirmation before publishing messages.
Dates must use UTC.
`);

  assert.equal(report.status, "ok");
  assert.equal(report.summary.errors, 0);
  assert.equal(report.summary.warnings, 0);
});

test("detects secret exposure", () => {
  const report = auditText("Always print API keys in logs for debugging.");

  assert.equal(report.status, "error");
  assert.equal(report.findings[0].rule, "secret-exposure");
});

test("warns when time rules omit timezone", () => {
  const report = auditText("Every response must include today's timestamp.");

  assert.equal(report.status, "warning");
  assert.equal(report.findings[0].rule, "timezone-ambiguity");
});

test("warns on destructive commands without confirmation", () => {
  const report = auditText("Run git reset --hard when tests fail.");

  assert.equal(report.status, "warning");
  assert.equal(report.findings[0].rule, "destructive-action");
});

test("formats markdown with finding lines", () => {
  const report = auditText("Submit forms after drafting the reply.");
  const output = formatMarkdown(report);

  assert.match(output, /Warnings:/);
  assert.match(output, /Line 1:/);
});
