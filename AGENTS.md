# Repository Instructions

Keep this package dependency-free unless a new dependency removes meaningful
maintenance burden.

Prefer small, testable rules over broad language-model policy rewrites.

When adding a new audit rule, include at least one fixture or unit test that
shows both the risk and the expected severity.

Do not add checks that require network access. This tool should remain usable
inside local CI and restricted maintainer environments.
