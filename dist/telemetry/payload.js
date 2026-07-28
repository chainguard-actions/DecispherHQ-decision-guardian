"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PAYLOAD_SCHEMA = void 0;
exports.buildPayload = buildPayload;
const identity_1 = require("./identity");
exports.PAYLOAD_SCHEMA = 2;
function buildPayload(source, snapshot, version) {
    return {
        event: 'run_complete',
        schema: exports.PAYLOAD_SCHEMA,
        version,
        source,
        timestamp: new Date().toISOString(),
        repo_hash: (0, identity_1.computeRepoHash)(),
        repo_visibility: (0, identity_1.resolveRepoVisibility)(),
        event_name: process.env.GITHUB_EVENT_NAME || null,
        metrics: {
            files_processed: snapshot.files_processed,
            decisions_evaluated: snapshot.decisions_evaluated,
            matches_found: snapshot.matches_found,
            critical_matches: snapshot.critical_matches,
            warning_matches: snapshot.warning_matches,
            info_matches: snapshot.info_matches,
            duration_ms: snapshot.duration_ms,
        },
        environment: {
            node_version: process.version,
            os_platform: process.platform,
            ci: !!process.env.CI,
        },
    };
}
