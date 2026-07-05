<!-- markdownlint-disable -->

# Hardening Report: DecispherHQ--decision-guardian--/v1.2.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `1`

Action **DecispherHQ--decision-guardian--/v1.2.1** was hardened automatically. 3 finding(s) were identified and resolved across 2 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Both workflow files reference external actions using mutable version tags instead of full 40-character commit SHAs. In release.yml: 'actions/checkout@v4' and 'actions/setup-node@v4'. In test.yml: 'actions/checkout@v4' (×2) and 'actions/setup-node@v4' (×2). These tags can be moved to point to different commits, enabling supply-chain attacks.

Locations:

- `.github/workflows/release.yml:21`
- `.github/workflows/release.yml:25`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:20`
- `.github/workflows/test.yml:47`
- `.github/workflows/test.yml:50`

### script-injection (severity: high)

Sub-rule (a): In release.yml, the expression ${{ steps.version.outputs.VERSION }} is interpolated directly inside run: shell command strings. This value flows through YAML template substitution before the shell processes it, allowing shell metacharacters to be injected if the value were ever attacker-influenced. Offending lines include: `if git rev-parse "v${{ steps.version.outputs.VERSION }}"`, `echo "Tag v${{ steps.version.outputs.VERSION }} already exists"`, `echo "exists=true" >> $GITHUB_OUTPUT`, and `gh release create "v${{ steps.version.outputs.VERSION }}" --title "v${{ steps.version.outputs.VERSION }}"`. The value should be passed via an env: variable and double-quoted in the shell.

Locations:

- `.github/workflows/release.yml:43`
- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:55`

### missing-permissions (severity: medium)

test.yml has no top-level permissions: key and no job-level permissions: on any of its jobs ('test' and 'cli-smoke-test'). Without explicit permissions, the workflow inherits the repository's default token permissions, which may be overly broad. Explicit minimal permissions should be declared for each job.

Locations:

- `.github/workflows/test.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings: (1) Pinned actions/checkout@v4 → @34e114876b0b11c390a56381ad16ebd13914f8d5 and actions/setup-node@v4 → @49933ea5288caeca8642d1e84afbd3f7d6820020 in both release.yml and test.yml. (2) In release.yml, moved ${{ steps.version.outputs.VERSION }} into env: blocks (VERSION: ${{ steps.version.outputs.VERSION }}) for the 'Check if tag exists' and 'Create Release Tag' steps, referencing it as $VERSION in the shell scripts. (3) Added permissions: contents: read to both 'test' and 'cli-smoke-test' jobs in test.yml.

### Iteration 2

**Fixes applied:** missing-permissions

**Notes:**

Added top-level `permissions: {}` to release.yml to restrict default token permissions, and added a job-level `permissions: contents: read` block to the `test` job that calls the reusable workflow. The `release` job already had explicit minimal permissions (`contents: write`, `id-token: write`) so no changes were needed there.

