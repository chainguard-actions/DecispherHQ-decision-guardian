<!-- markdownlint-disable -->

# Hardening Report: DecispherHQ--decision-guardian/v1.2.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **DecispherHQ--decision-guardian/v1.2.0** was hardened automatically. 5 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### script-injection (severity: high)

Sub-rule (a): ${{ steps.version.outputs.VERSION }} is interpolated directly inside run: shell commands in the 'Check if tag exists' step and the 'Create Release Tag' step. Any ${{ ... }} expression inside a run block undergoes YAML template substitution before the shell sees it, enabling script injection. Offending lines: `if git rev-parse "v${{ steps.version.outputs.VERSION }}"` (line 40), `echo "Tag v${{ steps.version.outputs.VERSION }} already exists"` (line 41), and `gh release create "v${{ steps.version.outputs.VERSION }}"` (line 53). Fix: move the value into an env: variable and reference it as a quoted shell variable.

Locations:

- `.github/workflows/release.yml:40`
- `.github/workflows/release.yml:41`
- `.github/workflows/release.yml:53`

### unpinned-uses (severity: high)

The following uses: references use mutable tag refs instead of pinned 40-character commit SHAs, making the workflow vulnerable to supply-chain attacks: actions/checkout@v4 (line 22) and actions/setup-node@v4 (line 26). Fix: pin each to a full SHA, e.g. actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.

Locations:

- `.github/workflows/release.yml:22`
- `.github/workflows/release.yml:26`

### unpinned-uses (severity: high)

The following uses: references use mutable tag refs instead of pinned 40-character commit SHAs: actions/checkout@v4 (lines 16, 55) and actions/setup-node@v4 (lines 19, 58). Fix: pin each to a full SHA, e.g. actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4.

Locations:

- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:19`
- `.github/workflows/test.yml:55`
- `.github/workflows/test.yml:58`

### missing-permissions (severity: medium)

The workflow has no top-level permissions: key and neither the test job nor the cli-smoke-test job defines a job-level permissions: block. Without explicit permissions, the workflow inherits the repository default token permissions which may be overly broad. Add a top-level permissions: {} or minimal specific scopes to restrict the GITHUB_TOKEN.

Locations:

- `.github/workflows/test.yml:1`

### missing-permissions (severity: medium)

The workflow has no top-level permissions: key. While the release job defines job-level permissions (contents: write, id-token: write), the test job (which calls the reusable workflow .github/workflows/test.yml) has no permissions: key. Since not every job has explicit permissions, the GITHUB_TOKEN for the test job may inherit overly broad default permissions. Add a permissions: block to the test job.

Locations:

- `.github/workflows/release.yml:13`

## Iteration Notes

### Iteration 1

**Fixes applied:** script-injection, unpinned-uses, missing-permissions

**Notes:**

Fixed all 5 findings across release.yml and test.yml:

1. script-injection (release.yml): Moved `${{ steps.version.outputs.VERSION }}` into `env: VERSION:` blocks in both 'Check if tag exists' and 'Create Release Tag' steps. Shell scripts now reference `$VERSION` safely.

2. unpinned-uses (release.yml): Pinned actions/checkout@v4 → @34e114876b0b11c390a56381ad16ebd13914f8d5 and actions/setup-node@v4 → @49933ea5288caeca8642d1e84afbd3f7d6820020.

3. unpinned-uses (test.yml): Pinned all four uses references (actions/checkout and actions/setup-node in both test and cli-smoke-test jobs) to the same full SHAs.

4. missing-permissions (test.yml): Added top-level `permissions: {}` to restrict GITHUB_TOKEN.

5. missing-permissions (release.yml): Added `permissions: {}` to the test job that calls the reusable workflow.

