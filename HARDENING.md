<!-- markdownlint-disable -->

# Hardening Report: DecispherHQ--decision-guardian/v1.1.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **DecispherHQ--decision-guardian/v1.1.0** was hardened automatically. 4 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): `${{ steps.version.outputs.VERSION }}` is interpolated directly inside `run:` shell commands in two steps. `steps.*.outputs.*` flows through YAML template substitution before the shell sees it, enabling script injection. Affected steps: 'Check if tag exists' (e.g. `if git rev-parse "v${{ steps.version.outputs.VERSION }}"`) and 'Create Release Tag' (e.g. `git tag -a "v${{ steps.version.outputs.VERSION }}"`). Fix: move the value into an `env:` variable and double-quote the shell expansion.

Locations:

- `.github/workflows/release.yml:48`
- `.github/workflows/release.yml:66`

### unpinned-uses (severity: high)

Multiple `uses:` references pin to mutable version tags instead of immutable 40-character commit SHAs, making the workflow vulnerable to supply-chain attacks if the tag is moved. Failing references in release.yml: `actions/checkout@v4` and `actions/setup-node@v4`. Failing references in test.yml: `actions/checkout@v4` (×2) and `actions/setup-node@v4` (×2). Each should be pinned to a full SHA, e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`.

Locations:

- `.github/workflows/release.yml:22`
- `.github/workflows/release.yml:27`
- `.github/workflows/test.yml:18`
- `.github/workflows/test.yml:21`
- `.github/workflows/test.yml:53`
- `.github/workflows/test.yml:56`

### missing-permissions (severity: medium)

test.yml has no top-level `permissions:` key and neither the `test` job nor the `cli-smoke-test` job defines a job-level `permissions:` block. Without explicit permissions the workflow inherits the repository default (often `write-all`), granting excessive access. Add a top-level `permissions: {}` or specific minimal permissions to each job.

Locations:

- `.github/workflows/test.yml:1`

### missing-permissions (severity: medium)

release.yml has no top-level `permissions:` key and the `test` job (which calls the reusable workflow `./.github/workflows/test.yml`) has no job-level `permissions:` block. Only the `release` job has explicit permissions. The `test` job therefore inherits the repository default. Add a `permissions: {}` block to the `test` job (or a restrictive top-level block) to limit its access.

Locations:

- `.github/workflows/release.yml:12`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all four findings across release.yml and test.yml:

1. script-injection: Moved `${{ steps.version.outputs.VERSION }}` into `env: VERSION:` blocks in both 'Check if tag exists' and 'Create Release Tag' steps in release.yml. Shell scripts now use `$VERSION` instead of template expressions.

2. unpinned-uses: Pinned actions/checkout@v4 → @34e114876b0b11c390a56381ad16ebd13914f8d5 and actions/setup-node@v4 → @49933ea5288caeca8642d1e84afbd3f7d6820020 in both release.yml and test.yml (all 6 occurrences).

3. missing-permissions (test.yml): Added top-level `permissions: {}` to test.yml.

4. missing-permissions (release.yml test job): Added `permissions: {}` to the `test` job in release.yml that calls the reusable workflow.

