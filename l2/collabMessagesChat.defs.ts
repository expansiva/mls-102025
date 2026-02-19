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
    "group": "CONNECT",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-prompt-102025",
      "collab-messages-task-102025",
      "collab-messages-task-info-102025",
      "collab-messages-topics-102025",
      "collab-messages-avatar-102025",
      "collab-messages-thread-details-102025",
      "collab-messages-user-modal-102025",
      "collab-messages-thread-modal-102025",
      "collab-messages-filter-102025",
      "collab-messages-add-102025",
      "collab-messages-rich-preview-text-102025",
      "collab-messages-text-code-102025"
    ],
    "imports": [
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
            "name": "collab_translate",
            "type": "constant"
          },
          {
            "name": "collab_circle_exclamation",
            "type": "constant"
          },
          {
            "name": "collab_plus",
            "type": "constant"
          },
          {
            "name": "collab_folder_tree",
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
        "ref": "/_100554_/l2/libCommom.js",
        "dependencies": [
          {
            "name": "openElementInServiceDetails",
            "type": "function"
          },
          {
            "name": "clearServiceDetails",
            "type": "function"
          },
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
            "name": "getTemporaryContext",
            "type": "function"
          },
          {
            "name": "formatTimestamp",
            "type": "function"
          },
          {
            "name": "notifyThreadChange",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "loadAgent",
            "type": "function"
          },
          {
            "name": "executeBeforePrompt",
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
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "loadChatPreferences",
            "type": "function"
          },
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
            "name": "defaultThreadImage",
            "type": "constant"
          },
          {
            "name": "IChatPreferences",
            "type": "interface"
          },
          {
            "name": "AGENTDEFAULT",
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
        "ref": "/_100554_/l2/aiAgentBase.js",
        "dependencies": [
          {
            "name": "IAgent",
            "type": "interface"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      },
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
        "ref": "/_102025_/l2/collabMessagesTaskInfo.js"
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
  "asIs": {
    "semantic": {
      "generalDescription": "Main chat interface component for Collab Messages system supporting real-time messaging, AI task integration, thread management, and multi-language support.",
      "businessCapabilities": [
        "Real-time messaging between users",
        "Thread-based conversation management",
        "AI agent task execution and monitoring",
        "Message translation and localization",
        "User mentions and channel references",
        "Thread archiving and deletion workflows",
        "Notification management",
        "Direct messaging support",
        "Message filtering by topics"
      ],
      "technicalCapabilities": [
        "LitElement-based web component architecture",
        "IndexedDB integration for offline message storage",
        "RESTful API integration for message synchronization",
        "Event-driven architecture with custom events",
        "Infinite scroll pagination for message history",
        "Dynamic view rendering based on active scenery state",
        "Rich text preview with mention hover effects",
        "Multi-language i18n support",
        "Clipboard operations for chat content"
      ],
      "implementedFeatures": [
        "Thread list view with prefix-based grouping",
        "Chat detail view with chronological message grouping",
        "Message input with autocomplete for mentions and agents",
        "Task integration and monitoring within chat",
        "Thread status management (active, archived, deleting, deleted)",
        "Real-time thread search and filtering",
        "Welcome message display for new threads",
        "Multiple message translation display modes",
        "Copy-paste functionality preserving message metadata",
        "Notification badge and favicon management",
        "User and thread modal previews on hover",
        "Message pagination and lazy loading"
      ],
      "constraints": [
        "Requires valid userId for all API operations",
        "Dependent on mls.api backend services",
        "Limited to specific module groups (CONNECT, APPS, DOCS, CRM)",
        "Requires child web components to be loaded",
        "Browser IndexedDB support required for offline functionality",
        "Scroll position management for UX continuity"
      ]
    }
  }
}
    