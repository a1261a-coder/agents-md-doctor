import fs from "node:fs";

const HARD_RULE_RE = /\b(must|always|never|required|forbidden|prohibited|shall|do not|don't)\b/i;
const OPPOSING_MODAL_RE = /\b(always|must|shall|required)\b.*\b(never|forbidden|prohibited|do not|don't)\b|\b(never|forbidden|prohibited|do not|don't)\b.*\b(always|must|shall|required)\b/i;
const SECRET_RE = /\b(secret|tokens?|api[_ -]?keys?|passwords?|credentials?|private keys?)\b/i;
const EXPOSURE_RE = /\b(print|logs?|show|display|share|send|upload|paste|commit|publish)\b/i;
const DESTRUCTIVE_RE = /\b(rm\s+-rf|git\s+reset\s+--hard|git\s+clean\s+-fd|git\s+checkout\s+--|delete|destroy|wipe)\b/i;
const CONFIRM_RE = /\b(confirm|confirmation|approval|ask first|explicitly requested|explicit consent)\b/i;
const TIME_RE = /\b(date|time|today|tomorrow|yesterday|timezone|timestamp|calendar|schedule)\b/i;
const TIMEZONE_RE = /\b(UTC|GMT|timezone|time zone|Asia\/[A-Za-z_]+|America\/[A-Za-z_]+|Europe\/[A-Za-z_]+|[+-][0-9]{2}:[0-9]{2})\b/;
const EXTERNAL_ACTION_RE = /\b(submit|send|post|publish|upload|email|message|form|comment|reply)\b/i;

export function auditText(text, options = {}) {
  const filePath = options.filePath ?? "AGENTS.md";
  const lines = text.split(/\r?\n/);
  const findings = [];
  const hardRuleLines = [];

  function add(severity, rule, message, line = null) {
    findings.push({ severity, rule, message, line });
  }

  if (text.trim().length === 0) {
    add("error", "empty-file", "Instruction file is empty.");
  }

  if (Buffer.byteLength(text, "utf8") > 24000) {
    add("warning", "large-file", "Instruction file is large enough to bury high-priority rules.");
  }

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1;
    if (HARD_RULE_RE.test(line)) {
      hardRuleLines.push(lineNumber);
    }

    if (OPPOSING_MODAL_RE.test(line)) {
      add("warning", "opposing-modals", "Line mixes mandatory and forbidden language; split or clarify it.", lineNumber);
    }

    if (SECRET_RE.test(line) && EXPOSURE_RE.test(line) && !CONFIRM_RE.test(line)) {
      add("error", "secret-exposure", "Secret-handling language permits exposure without explicit confirmation.", lineNumber);
    }

    if (DESTRUCTIVE_RE.test(line) && !CONFIRM_RE.test(line)) {
      add("warning", "destructive-action", "Destructive operation is mentioned without confirmation language.", lineNumber);
    }

    if (TIME_RE.test(line) && !TIMEZONE_RE.test(line)) {
      add("warning", "timezone-ambiguity", "Date or time rule should name an explicit timezone.", lineNumber);
    }

    if (EXTERNAL_ACTION_RE.test(line) && !CONFIRM_RE.test(line)) {
      add("warning", "external-side-effect", "External side-effect language should include explicit consent.", lineNumber);
    }
  }

  if (hardRuleLines.length > 25) {
    add(
      "warning",
      "hard-rule-density",
      `Instruction file has ${hardRuleLines.length} hard-rule lines; important rules may become hard to prioritize.`
    );
  }

  return {
    filePath,
    status: statusFor(findings),
    summary: {
      lines: lines.length,
      bytes: Buffer.byteLength(text, "utf8"),
      checks: 9,
      errors: findings.filter((finding) => finding.severity === "error").length,
      warnings: findings.filter((finding) => finding.severity === "warning").length,
      hardRuleLines: hardRuleLines.length
    },
    findings
  };
}

export function auditFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return {
      filePath,
      status: "error",
      summary: {
        lines: 0,
        bytes: 0,
        checks: 1,
        errors: 1,
        warnings: 0,
        hardRuleLines: 0
      },
      findings: [
        {
          severity: "error",
          rule: "missing-file",
          message: "Instruction file does not exist.",
          line: null
        }
      ]
    };
  }

  return auditText(fs.readFileSync(filePath, "utf8"), { filePath });
}

export function formatMarkdown(report) {
  const sections = [
    `${report.filePath} audit`,
    `Status: ${report.status}`,
    `Checks: ${report.summary.checks}`,
    `Lines: ${report.summary.lines}`,
    `Hard-rule lines: ${report.summary.hardRuleLines}`
  ];

  const errors = report.findings.filter((finding) => finding.severity === "error");
  const warnings = report.findings.filter((finding) => finding.severity === "warning");

  if (errors.length > 0) {
    sections.push("", "Errors:", ...errors.map(formatFinding));
  }

  if (warnings.length > 0) {
    sections.push("", "Warnings:", ...warnings.map(formatFinding));
  }

  if (report.findings.length === 0) {
    sections.push("", "No issues found.");
  }

  return `${sections.join("\n")}\n`;
}

function formatFinding(finding) {
  const location = finding.line === null ? "" : `Line ${finding.line}: `;
  return `- ${location}${finding.message}`;
}

function statusFor(findings) {
  if (findings.some((finding) => finding.severity === "error")) {
    return "error";
  }

  if (findings.some((finding) => finding.severity === "warning")) {
    return "warning";
  }

  return "ok";
}
