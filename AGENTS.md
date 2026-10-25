# Contributor and agent guidance

## Scope and current state

This file applies to the entire repository. RunSet currently contains project
documentation only; no application framework, package manager, or test suite has
been selected.

## Working in this repository

- Inspect the current files and Git status before editing. Preserve unrelated
  changes.
- Follow the user's requested scope. Do not choose a technology stack or add
  dependencies solely to satisfy these instructions.
- Once code and tooling exist, follow their established conventions and check
  for more specific `AGENTS.md` instructions in the directories being changed.
- Never commit secrets, credentials, local environment files, or generated
  dependency directories.

## Documentation upkeep

- Keep `README.md` aligned with the actual project status, repository structure,
  prerequisites, and available setup, development, build, and test commands.
- Update this file when repository conventions or verification workflows change.
- Document commands only after their supporting code or configuration exists.

## Verification and handoff

- For documentation changes, review the diff for accuracy and formatting and
  check that local links resolve. No automated test command currently exists.
- When executable code is added, run the relevant checks supported by the
  repository and record their results. Explain any checks that could not run.
- Summarize the changes and verification performed. Commit or push only when
  requested by the user.
