/// <mls fileReference="_102025_/l2/collabMessagesSyncNotifications.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSyncNotifications.ts",
    "componentType": "tool",
    "componentScope": "appFrontEnd",
    "group": "collabMessages"
  },
  "references": {
    "imports": [
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "getUserId",
            "type": "function"
          },
          {
            "name": "loadNotificationDeviceId",
            "type": "function"
          },
          {
            "name": "loadNotificationPreferencesAudio",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "getThread",
            "type": "function"
          },
          {
            "name": "updateThread",
            "type": "function"
          },
          {
            "name": "getMessage",
            "type": "function"
          },
          {
            "name": "addMessages",
            "type": "function"
          },
          {
            "name": "getAllThreads",
            "type": "function"
          },
          {
            "name": "addThread",
            "type": "function"
          },
          {
            "name": "getCompactUTC",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/libCommom.js",
        "dependencies": [
          {
            "name": "changeFavIcon",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "notifyThreadChange",
            "type": "function"
          }
        ]
      }
    ],
    "statesRO": [
      "mls.services['102025_serviceCollabMessages_left']",
      "mls.stor.cache",
      "mls.api",
      "mls.msg.MessagePerformanceCache"
    ],
    "statesRW": [
      "threadSyncMap",
      "hasNotificationMessages",
      "syncTimeout"
    ]
  },
  "codeInsights": {
    "todos": [],
    "securityWarnings": [],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [],
    "i18nWarnings": [
      "Erro on play notification audio:"
    ],
    "performanceHints": [
      "Audio element created on every listenToThreadEvents call - consider singleton pattern",
      "setTimeout with 500ms for batching thread sync operations"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Service worker message handler for real-time chat notification synchronization with IndexedDB persistence",
      "businessCapabilities": [
        "Listen to push notification events from service worker",
        "Synchronize thread updates in background",
        "Play audio notification for new messages",
        "Update favicon badge for unread messages",
        "Toggle UI badge indicator on message service",
        "Batch thread sync operations with debouncing",
        "Handle thread status changes",
        "Persist messages and threads to IndexedDB"
      ],
      "technicalCapabilities": [
        "Service Worker message event handling",
        "IndexedDB CRUD operations for threads and messages",
        "Audio playback for notifications",
        "Favicon manipulation",
        "DOM service locator pattern (mls.services)",
        "Debounced batch processing with Map-based queue",
        "Async/await error handling",
        "Date/ISO string manipulation"
      ],
      "implementedFeatures": [
        "Thread synchronization queue with Map-based state",
        "Background thread update fetching via API",
        "Notification sound playback with volume control",
        "Unread message badge on favicon and service UI",
        "Conditional notification based on document visibility and active thread",
        "Message persistence with footers preservation",
        "Thread status change detection",
        "Multi-thread pending update chaining"
      ],
      "constraints": [
        "Requires service worker registration",
        "Depends on mls global object for API, cache, and services",
        "Audio file path hardcoded to ./l3/_100529_/audio/collabNotification.mp3",
        "500ms debounce delay for sync operations",
        "Requires userId and optional deviceId for API calls"
      ]
    }
  }
}
    