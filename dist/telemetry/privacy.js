"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePrivacy = validatePrivacy;
const identity_1 = require("./identity");
const BLOCKED_FIELDS = new Set([
    'repo_name',
    'org_name',
    'repo_url',
    'remote_url',
    'file_names',
    'file_paths',
    'pr_title',
    'pr_body',
    'decision_content',
    'user_names',
    'github_token',
    'commit_message',
    'branch_name',
    'author',
    'email',
]);
/** Fields that must carry a hash, never a raw value, if present at all. */
const HASHED_FIELDS = new Set(['repo_hash']);
function validatePrivacy(payload) {
    const violations = findBlockedKeys(payload);
    if (violations.length > 0) {
        throw new Error(`Telemetry privacy violation: blocked fields found: ${violations.join(', ')}`);
    }
    const malformed = findMalformedHashes(payload);
    if (malformed.length > 0) {
        throw new Error(`Telemetry privacy violation: non-hashed value in hashed field: ${malformed.join(', ')}`);
    }
}
function findMalformedHashes(obj, prefix = '') {
    const violations = [];
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        if (HASHED_FIELDS.has(key.toLowerCase())) {
            if (value !== null && (typeof value !== 'string' || !identity_1.REPO_HASH_PATTERN.test(value))) {
                violations.push(fullKey);
            }
        }
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            violations.push(...findMalformedHashes(value, fullKey));
        }
    }
    return violations;
}
function findBlockedKeys(obj, prefix = '') {
    const violations = [];
    for (const key of Object.keys(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (BLOCKED_FIELDS.has(key.toLowerCase())) {
            violations.push(fullKey);
        }
        if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
            violations.push(...findBlockedKeys(obj[key], fullKey));
        }
    }
    return violations;
}
