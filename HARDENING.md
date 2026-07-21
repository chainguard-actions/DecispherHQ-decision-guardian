<!-- markdownlint-disable -->

# Hardening Report: DecispherHQ--decision-guardian/v1.2.1

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **DecispherHQ--decision-guardian/v1.2.1** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Multiple `uses:` references are pinned to mutable version tags (@v4) rather than immutable 40-character commit SHAs. This exposes the workflow to supply-chain attacks if the tag is moved to a malicious commit. Affected references: `actions/checkout@v4` and `actions/setup-node@v4` in both workflow files.

Locations:

- `.github/workflows/release.yml:22`
- `.github/workflows/release.yml:27`
- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:21`

### script-injection (severity: high)

Sub-rule (a): `${{ steps.version.outputs.VERSION }}` is interpolated directly inside `run:` shell command strings in release.yml. The `steps.*.outputs.*` context flows through YAML template substitution before the shell processes it, allowing shell metacharacters to be injected. Offending lines: (1) `if git rev-parse "v${{ steps.version.outputs.VERSION }}"` in the 'Check if tag exists' step; (2) `echo "Tag v${{ steps.version.outputs.VERSION }} already exists"` in the same step; (3) `gh release create "v${{ steps.version.outputs.VERSION }}" --title "v${{ steps.version.outputs.VERSION }}"` in the 'Create Release Tag' step. These should be moved to `env:` variables and double-quoted in the shell script.

Locations:

- `.github/workflows/release.yml:44`
- `.github/workflows/release.yml:45`
- `.github/workflows/release.yml:59`

### missing-permissions (severity: medium)

Neither workflow file has a top-level `permissions:` block, and not all jobs have job-level permissions. In `test.yml`, neither the `test` job nor the `cli-smoke-test` job defines a `permissions:` key, so they inherit the default broad repository permissions. In `release.yml`, the `test` job (a reusable workflow call) also has no `permissions:` key. Without explicit minimal permissions, the GITHUB_TOKEN is granted more access than necessary.

Locations:

- `.github/workflows/test.yml:1`
- `.github/workflows/release.yml:12`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings across both workflow files:

1. **unpinned-uses**: Pinned `actions/checkout@v4` to SHA `11d5960a326750d5838078e36cf38b85af677262` and `actions/setup-node@v4` to SHA `49933ea5288caeca8642d1e84afbd3f7d6820020` in both `.github/workflows/release.yml` and `.github/workflows/test.yml`, preserving the tag as a comment.

2. **script-injection**: In `release.yml`, moved `${{ steps.version.outputs.VERSION }}` out of all three `run:` shell strings and into `env:` blocks as `VERSION: ${{ steps.version.outputs.VERSION }}`. The shell scripts now reference the safe `$VERSION` environment variable instead.

3. **missing-permissions**: Added top-level `permissions: {}` to both workflow files. Added `permissions: {}` to the `test` reusable workflow call job in `release.yml`. Added `permissions: { contents: read }` to both `test` and `cli-smoke-test` jobs in `test.yml` (minimum needed for checkout).

