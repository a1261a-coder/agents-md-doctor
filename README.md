# agents-md-doctor

`agents-md-doctor` is a small, dependency-free CLI for reviewing `AGENTS.md` files before they are committed to an open-source repository.

Agent instruction files are powerful, but they are easy to make brittle: teams often add too many hard rules, hidden contradictions, ambiguous timezone rules, unsafe secret-handling language, or broad external-action permissions. This tool gives maintainers a quick local audit they can run in CI or before a release.

## Install

```sh
npm install -g agents-md-doctor
```

For local development:

```sh
npm install
npm test
node src/cli.js AGENTS.md
```

## Usage

```sh
agents-md-doctor AGENTS.md
agents-md-doctor --json AGENTS.md
agents-md-doctor --strict AGENTS.md
```

`--strict` exits with a non-zero status when warnings are found. Errors always produce a non-zero exit status.

## What It Checks

- Missing or empty instruction files
- - Very large files that are likely to bury important rules
  - - High density of hard rules such as `must`, `always`, and `never`
    - - Lines that mix opposing modal language
      - - Broad permission to expose secrets, tokens, passwords, or keys
        - - Destructive shell or git operations without confirmation language
          - - Date or time rules that omit an explicit timezone
            - - External posting, sending, uploading, or form-submission language without a consent rule
             
              - The tool is intentionally heuristic. It does not try to replace human review; it helps maintainers find the risks that are easiest to miss.
             
              - ## Roadmap
             
              - - Configurable rule severity
                - - Suggested rewrites for common instruction conflicts
                  - - Repository-wide scan mode
                    - - SARIF output for code scanning integrations
                     
                      - ## License
                     
                      - MIT
                      - 
