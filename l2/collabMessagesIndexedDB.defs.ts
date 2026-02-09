/// <mls fileReference="_102025_/l2/collabMessagesIndexedDB.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesIndexedDB.ts",
    "componentType": "repository",
    "componentScope": "appFrontEnd"
  },
  "codeInsights": {
    "performanceHints": [
      "Uses IndexedDB indexes for efficient queries",
      "Implements cursor-based pagination for memory efficiency",
      "Enforces message limit per thread to control storage usage"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "IndexedDB repository providing local data persistence for collaborative messaging with support for threads, messages, users, tasks and pooling operations",
      "businessCapabilities": [
        "Local persistence of chat messages and threads",
        "Offline user data caching",
        "Task management storage",
        "Polling task tracking",
        "Thread lifecycle management with cleanup"
      ],
      "technicalCapabilities": [
        "IndexedDB CRUD operations",
        "Database schema versioning and migration",
        "Compound indexing strategies",
        "Cursor-based pagination implementation",
        "Transactional batch operations",
        "Cascade deletion patterns",
        "Compact UTC timestamp generation"
      ],
      "implementedFeatures": [
        "Database version 5 with object stores for threads, messages, users, tasks, poolings",
        "Compound index byThreadId_orderAt for chronological message retrieval",
        "Message pagination with limit and offset parameters",
        "Automatic message retention policy (max 100 per thread)",
        "Thread cleanup based on validity and unread count criteria",
        "Index management for byName, byUserId, byStartAt"
      ],
      "constraints": [
        "Maximum 100 messages stored per thread (MAXMESSAGESBYTHREAD)",
        "Requires browser support for IndexedDB",
        "Uses compact UTC timestamp format (YYYYMMDDHHMMSS)"
      ]
    }
  }
}
    