"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REPO_HASH_PATTERN = exports.REPO_HASH_LENGTH = void 0;
exports.normalizeRepoRef = normalizeRepoRef;
exports.resolveRepoRef = resolveRepoRef;
exports.computeRepoHash = computeRepoHash;
exports.resolveRepoVisibility = resolveRepoVisibility;
/**
 * Pseudonymous repository identity for telemetry.
 *
 */
const crypto_1 = require("crypto");
const child_process_1 = require("child_process");
const fs_1 = require("fs");
const REPO_HASH_SALT = 'decision-guardian.repo-identity.v1';
exports.REPO_HASH_LENGTH = 16;
exports.REPO_HASH_PATTERN = /^[a-f0-9]{16}$/;
/**
 * Normalize a repository reference so the same repo always yields the same
 * hash regardless of how it was addressed.
 *
 * All of these collapse to `github.com/owner/repo`:
 *   git@github.com:Owner/Repo.git
 *   https://github.com/owner/repo
 *   https://x-access-token:TOKEN@github.com/owner/repo.git
 *   owner/repo            (GITHUB_REPOSITORY form, assumed github.com)
 */
function normalizeRepoRef(raw) {
    let ref = raw.trim();
    if (!ref)
        return null;
    if (/^[^/\s:]+\/[^/\s:]+$/.test(ref) && !ref.includes('@')) {
        return `github.com/${ref.toLowerCase()}`;
    }
    const scp = ref.match(/^[^@\s]+@([^:\s]+):(.+)$/);
    if (scp) {
        ref = `${scp[1]}/${scp[2]}`;
    }
    else {
        ref = ref.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '');
        ref = ref.replace(/^[^@/]*@/, '');
    }
    ref = ref.replace(/\.git$/i, '').replace(/\/+$/, '');
    if (!ref.includes('/'))
        return null;
    return ref.toLowerCase();
}
/**
 * Resolve the current repository reference.
 * Prefers the CI-provided value; falls back to the git origin remote for
 * local CLI runs. Returns null when neither is available (never guesses).
 */
function resolveRepoRef() {
    const fromEnv = process.env.GITHUB_REPOSITORY;
    if (fromEnv)
        return normalizeRepoRef(fromEnv);
    try {
        const out = (0, child_process_1.execFileSync)('git', ['config', '--get', 'remote.origin.url'], {
            encoding: 'utf-8',
            timeout: 2000,
            stdio: ['ignore', 'pipe', 'ignore'],
            windowsHide: true,
        });
        return normalizeRepoRef(out);
    }
    catch {
        return null;
    }
}
/**
 * Stable pseudonymous identifier for the current repository,
 * or null when the repository cannot be determined.
 */
function computeRepoHash(ref = resolveRepoRef()) {
    if (!ref)
        return null;
    return (0, crypto_1.createHmac)('sha256', REPO_HASH_SALT)
        .update(ref, 'utf8')
        .digest('hex')
        .substring(0, exports.REPO_HASH_LENGTH);
}
function resolveRepoVisibility() {
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath)
        return null;
    try {
        const payload = JSON.parse((0, fs_1.readFileSync)(eventPath, 'utf-8'));
        const isPrivate = payload?.repository?.private;
        if (typeof isPrivate !== 'boolean')
            return null;
        return isPrivate ? 'private' : 'public';
    }
    catch {
        return null;
    }
}
