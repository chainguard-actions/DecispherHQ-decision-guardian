<!-- markdownlint-disable -->

# Hardening Report: DecispherHQ--decision-guardian/v1.3.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **DecispherHQ--decision-guardian/v1.3.0** was hardened automatically. 3 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

Both workflow files reference GitHub Actions using mutable version tags (@v4) instead of pinned 40-character commit SHAs. This exposes the workflow to supply-chain attacks if the tag is moved to a malicious commit. Affected references: `actions/checkout@v4` and `actions/setup-node@v4` in both release.yml and test.yml.

Locations:

- `.github/workflows/release.yml:22`
- `.github/workflows/release.yml:27`
- `.github/workflows/test.yml:17`
- `.github/workflows/test.yml:22`
- `.github/workflows/test.yml:50`
- `.github/workflows/test.yml:55`

### script-injection (severity: high)

In release.yml, the expression `${{ steps.version.outputs.VERSION }}` (a `steps.*.outputs.*` context value) is interpolated directly inside `run:` shell command strings. Per the script-injection check, any `${{ ... }}` expression inside a `run:` block is a script-injection risk because YAML template substitution occurs before the shell ever sees the value, allowing shell metacharacters to be injected. Sub-rule (a) violated. Offending lines: `if git rev-parse "v${{ steps.version.outputs.VERSION }}"` (line 48), `echo "Tag v${{ steps.version.outputs.VERSION }} already exists"` (line 49), and `gh release create "v${{ steps.version.outputs.VERSION }}" --title "v${{ steps.version.outputs.VERSION }}"` (line 60). Fix: store the value in an env var and reference it as `"$VERSION"` in the shell.

Locations:

- `.github/workflows/release.yml:48`
- `.github/workflows/release.yml:49`
- `.github/workflows/release.yml:60`

### missing-permissions (severity: medium)

test.yml has no top-level `permissions:` key and neither the `test` job nor the `cli-smoke-test` job defines job-level permissions. This means the workflow runs with the default (potentially broad) GITHUB_TOKEN permissions. release.yml also has no top-level `permissions:` key, and the `test` job (which calls the reusable workflow) has no job-level `permissions:` key — only the `release` job has explicit permissions.

Locations:

- `.github/workflows/test.yml:1`
- `.github/workflows/release.yml:12`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, script-injection, missing-permissions

**Notes:**

Fixed all three findings across both workflow files:

1. **unpinned-uses**: Pinned `actions/checkout@v4` → `@11d5960a326750d5838078e36cf38b85af677262 # v4` and `actions/setup-node@v4` → `@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` in both release.yml and test.yml (6 locations total).

2. **script-injection**: In release.yml, moved `${{ steps.version.outputs.VERSION }}` out of `run:` shell strings and into `env:` blocks as `VERSION: ${{ steps.version.outputs.VERSION }}`. Shell scripts now reference `$VERSION` safely. Fixed in both the 'Check if tag exists' step and the 'Create Release Tag' step.

3. **missing-permissions**: Added `permissions: contents: read` to both the `test` and `cli-smoke-test` jobs in test.yml. Added `permissions: {}` to the `test` job in release.yml (which calls the reusable workflow and needs no token permissions).

