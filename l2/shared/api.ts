/// <mls fileReference="_102025_/l2/shared/api.ts" enhancement="_blank"/>

// The collab-messages client now lives in 102036 (the base project every module
// can import without dependency cycles — 102025 depends on 102027, so the client
// could not live here). This file re-exports it for backward compatibility with
// existing imports from `/_102025_/l2/shared/api.js`.
export * from '/_102036_/l2/shared/api.js';
