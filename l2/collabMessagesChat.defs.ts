/// <mls fileReference="_102025_/l2/collabMessagesChat.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesChat.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "group": "CONNECT"
  },
  "references": {
    "webComponents": [
      "collab-messages-prompt-102025",
      "collab-messages-topics-102025",
      "collab-messages-chat-message-102025",
      "collab-messages-task-102025",
      "collab-messages-filter-102025",
      "collab-messages-add-102025",
      "collab-messages-thread-details-102025",
      "collab-messages-user-modal-102025",
      "collab-messages-thread-modal-102025",
      "collab-messages-rich-preview-text-102025",
      "collab-messages-text-code-102025"
    ],
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html",
            "type": "function"
          },
          {
            "name": "LitElement",
            "type": "class"
          },
          {
            "name": "unsafeHTML",
            "type": "function"
          },
          {
            "name": "nothing",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
          {
            "name": "customElement",
            "type": "function"
          },
          {
            "name": "property",
            "type": "function"
          },
          {
            "name": "state",
            "type": "function"
          },
          {
            "name": "query",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_chevron_left",
            "type": "constant"
          },
          {
            "name": "collab_gear",
            "type": "constant"
          },
          {
            "name": "collab_plus",
            "type": "constant"
          },
          {
            "name": "collab_folder_tree",
            "type": "constant"
          },
          {
            "name": "collab_bell",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesSyncNotifications.js",
        "dependencies": [
          {
            "name": "removeThreadFromSync",
            "type": "function"
          },
          {
            "name": "getThreadUpdateInBackground",
            "type": "function"
          },
          {
            "name": "checkIfNotificationUnread",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "notifyThreadChange",
            "type": "function"
          },
          {
            "name": "notifyThreadNotification",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "addOrUpdateTask",
            "type": "function"
          },
          {
            "name": "addMessages",
            "type": "function"
          },
          {
            "name": "addMessage",
            "type": "function"
          },
          {
            "name": "updateThread",
            "type": "function"
          },
          {
            "name": "updateUsers",
            "type": "function"
          },
          {
            "name": "getMessage",
            "type": "function"
          },
          {
            "name": "getMessagesByThreadId",
            "type": "function"
          },
          {
            "name": "deleteAllMessagesFromThread",
            "type": "function"
          },
          {
            "name": "listUsers",
            "type": "function"
          },
          {
            "name": "getThread",
            "type": "function"
          },
          {
            "name": "updateLastMessageReadTime",
            "type": "function"
          },
          {
            "name": "IDBThreadPerformanceCache",
            "type": "interface"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "getBotsContext",
            "type": "function"
          },
          {
            "name": "registerToken",
            "type": "function"
          },
          {
            "name": "loadNotificationPreferences",
            "type": "function"
          },
          {
            "name": "loadNotificationDeviceId",
            "type": "function"
          },
          {
            "name": "generateAgentAvatar",
            "type": "function"
          },
          {
            "name": "getTemporaryContext",
            "type": "function"
          },
          {
            "name": "formatTimestamp",
            "type": "function"
          },
          {
            "name": "changeFavIcon",
            "type": "function"
          },
          {
            "name": "IMessage",
            "type": "interface"
          },
          {
            "name": "IThreadInfo",
            "type": "interface"
          },
          {
            "name": "AGENTDEFAULT",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetMessagesAfter",
            "type": "function"
          },
          {
            "name": "msgGetMessagesBefore",
            "type": "function"
          },
          {
            "name": "msgGetTaskUpdate",
            "type": "function"
          },
          {
            "name": "msgGetThreadUpdates",
            "type": "function"
          },
          {
            "name": "msgAddMessage",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102036_/l2/environmentContract.js",
        "dependencies": [
          {
            "name": "environment",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesPrompt.js",
        "dependencies": [
          {
            "name": "CollabMessagesPrompt",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesChatMessage.js",
        "dependencies": [
          {
            "name": "CollabMessagesChatMessage102025",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "msg",
            "type": "?"
          }
        ]
      },
      {
        "ref": "/_102029_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesTask.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTopics.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesAvatar.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesThreadDetails.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesUserModal.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesThreadModal.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesFilter.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesAdd.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesRichPreviewText.js"
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Uses unsafeHTML for rendering avatar HTML content"
    ],
    "i18nWarnings": [
      "Loading messages...",
      "No find any widget to show task details"
    ],
    "performanceHints": [
      "Implements infinite scroll pagination for message history",
      "Uses requestAnimationFrame for smooth scrolling operations",
      "Implements scroll lock mechanism to prevent concurrent scroll handling"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based chat organism component supporting threaded conversations, task integration, agent mentions, and real-time updates with IndexedDB caching",
      "businessCapabilities": [
        "Real-time chat messaging with thread support",
        "Message threading and reply functionality",
        "Task management integration within chat context",
        "User and agent mention system (@ and @@)",
        "Thread lifecycle management (active, archived, deleting, deleted)",
        "Local message caching via IndexedDB",
        "Notification handling and unread message tracking",
        "Message search and filtering by topic",
        "Direct messaging support",
        "Welcome message display for new threads",
        "Message grouping by date with relative time display"
      ],
      "technicalCapabilities": [
        "LitElement-based web component architecture",
        "State management via StateLitElement base class",
        "Event-driven communication with CustomEvents",
        "IndexedDB integration for offline message storage",
        "REST API integration for server synchronization",
        "Agent/Bot integration for automated responses",
        "Multi-scene navigation (list, details, task, threadDetails, threadAdd)",
        "Clipboard API integration for message copying",
        "Scroll-based pagination (infinite scroll)",
        "DOM manipulation for modal management",
        "Date/time localization and formatting"
      ],
      "implementedFeatures": [
        "Thread list view with prefix-based grouping",
        "Chat detail view with message history and status indicators",
        "Task detail view with external widget integration",
        "Thread settings and participant management views",
        "New thread creation interface",
        "Rich message input with autocomplete for mentions",
        "Message status tracking (loading, failed, sent)",
        "Unread message indicators and new message labels",
        "Archive, delete, and restore thread operations",
        "Real-time thread and message synchronization",
        "Topic-based message filtering",
        "Message reply functionality with preview",
        "Rich text and code block rendering",
        "Dynamic avatar generation",
        "Notification badge handling for pending tasks",
        "Scroll position preservation across scene transitions"
      ],
      "constraints": [
        "Requires valid userId property to be set",
        "Depends on IndexedDB for local message persistence",
        "Requires environment configuration with agents and tasks support",
        "Operates within specific group contexts (CONNECT, APPS, DOCS, CRM)",
        "Requires server API availability for message synchronization",
        "Browser support for Clipboard API required for copy functionality"
      ]
    }
  }
}
    