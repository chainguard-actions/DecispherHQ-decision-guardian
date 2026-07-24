<!-- markdownlint-disable -->

# Hardening Report: DecispherHQ--decision-guardian/v1.0.0

> This file was generated automatically by the hardening agent.

**Policy SHA:** `d636be7e43ef829af6e853da6b3c7566db9f72fe`

**Test Policy SHA:** `843adf9e4b8f85d0c08b27b9d0b09dd094b54702`

**Harden Agent Version:** `2`

Action **DecispherHQ--decision-guardian/v1.0.0** was hardened automatically. 2 finding(s) were identified and resolved across 1 iteration(s).

## Findings Fixed

### unpinned-uses (severity: high)

The workflow file uses mutable tag refs instead of pinned full-length SHA digests, making the action vulnerable to supply-chain attacks if the referenced tags are moved or overwritten. Failing references: `actions/checkout@v4` and `actions/setup-node@v4`. These should be pinned to their full 40-character commit SHAs (e.g. `actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683 # v4`).

Locations:

- `.github/workflows/test.yml:16`
- `.github/workflows/test.yml:19`

### missing-permissions (severity: medium)

The workflow file has no top-level `permissions:` key and the only job (`test`) also has no job-level `permissions:` key. Without explicit permissions, the workflow inherits the repository's default token permissions, which may be broader than necessary. A minimal permissions block (e.g. `contents: read`) should be added at the top level or on each job.

Locations:

- `.github/workflows/test.yml:1`

## Iteration Notes

### Iteration 1

**Fixes applied:** unpinned-uses, missing-permissions

**Notes:**

In .github/workflows/test.yml: (1) Pinned `actions/checkout@v4` to `actions/checkout@11d5960a326750d5838078e36cf38b85af677262 # v4` and `actions/setup-node@v4` to `actions/setup-node@49933ea5288caeca8642d1e84afbd3f7d6820020 # v4` using resolved commit SHAs. (2) Added a top-level `permissions: contents: read` block to restrict the workflow token to the minimum permissions needed.

