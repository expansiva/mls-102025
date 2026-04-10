/// <mls fileReference="_102025_/l2/collabMessages.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessages.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-tab-menu-102025",
      "collab-messages-chat-102025",
      "collab-messages-tasks-102025",
      "collab-messages-moments-102025",
      "collab-messages-apps-102025",
      "collab-messages-settings-102025"
    ],
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html"
          },
          {
            "name": "ifDefined"
          },
          {
            "name": "nothing"
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
          {
            "name": "customElement"
          },
          {
            "name": "property"
          },
          {
            "name": "state"
          },
          {
            "name": "query"
          }
        ]
      },
      {
        "ref": "/_102036_/l2/environmentContract.js",
        "dependencies": [
          {
            "name": "environment"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "msg"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "listThreads"
          },
          {
            "name": "addThread"
          },
          {
            "name": "listUsers"
          },
          {
            "name": "updateUsers"
          },
          {
            "name": "getThread"
          },
          {
            "name": "cleanupThreads"
          },
          {
            "name": "listPoolings"
          },
          {
            "name": "getTask"
          },
          {
            "name": "getMessage"
          },
          {
            "name": "deletePooling"
          },
          {
            "name": "getAllThreads"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "saveLastTab"
          },
          {
            "name": "loadLastTab"
          },
          {
            "name": "saveUserId"
          },
          {
            "name": "saveLastAlertTime"
          },
          {
            "name": "loadLastAlertTime"
          },
          {
            "name": "changeFavIcon"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesSyncNotifications.js",
        "dependencies": [
          {
            "name": "checkIfNotificationUnread"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetUserUpdate"
          },
          {
            "name": "msgGetThreadUpdates"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "ICollabMessageEvent"
          }
        ]
      },
      {
        "ref": "/_102029_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_crm"
          },
          {
            "name": "collab_tasks"
          },
          {
            "name": "collab_connect"
          },
          {
            "name": "collab_moments"
          },
          {
            "name": "collab_gear"
          },
          {
            "name": "collab_bell_slash"
          },
          {
            "name": "collab_xmark"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesAdd.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesChat.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTasks.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesApps.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesMoments.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesSettings.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesFindtask.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTabMenu.js"
      }
    ]
  },
  "codeInsights": {
    "unusedImports": [
      "query"
    ],
    "deadCodeBlocks": [
      "// await continuePoolingTask(context);",
      "// this.execCoachMarks('CRM');",
      "// this.execCoachMarks('Tasks');",
      "// this.execCoachMarks('Moments');",
      "// this.execCoachMarks('Apps');",
      "// this.execCoachMarks('Connect');",
      "// this.setError('Invalid userId');"
    ],
    "i18nWarnings": [
      "setttins key should be settings"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Main messaging container component with tabbed interface for CRM, Tasks, Moments, Connect, and Apps",
      "businessCapabilities": [
        "Manage messaging threads across CRM, TASK, MOMENTS, CONNECT, and APPS groups",
        "Handle browser notification permissions",
        "Synchronize thread data with local IndexedDB",
        "Load and update user profiles"
      ],
      "technicalCapabilities": [
        "Lit web component with TypeScript",
        "IndexedDB integration for offline thread storage",
        "Custom event handling for thread-change, thread-create, thread-open",
        "Internationalization support for English and Portuguese",
        "Dynamic tab-based rendering",
        "Notification pooling task management"
      ],
      "implementedFeatures": [
        "Tab navigation menu (CRM, TASK, MOMENTS, CONNECT, APPS, SETTINGS)",
        "Thread synchronization from API to IndexedDB",
        "User profile retrieval and storage",
        "Notification permission alert with weekly recurrence",
        "Dynamic rendering of chat, tasks, moments, apps, and settings views",
        "Event-driven thread updates"
      ],
      "constraints": [
        "Requires Notification API",
        "Requires IndexedDB",
        "Depends on environment configuration for menu mode"
      ]
    }
  }
}
