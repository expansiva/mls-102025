/// <mls fileReference="_102025_/l2/collabMessagesSettings.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSettings.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "group": "CollabMessages",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-settings-102025"
    ],
    "imports": [
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
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "updateUsers",
            "type": "function"
          },
          {
            "name": "listThreads",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/serviceBase.js",
        "dependencies": [
          {
            "name": "ServiceBase",
            "type": "class"
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
            "name": "saveChatPreferences",
            "type": "function"
          },
          {
            "name": "saveNotificationPreferencesAudio",
            "type": "function"
          },
          {
            "name": "loadNotificationPreferencesAudio",
            "type": "function"
          },
          {
            "name": "loadNotificationPreferences",
            "type": "function"
          },
          {
            "name": "registerToken",
            "type": "function"
          },
          {
            "name": "saveNotificationPreferences",
            "type": "function"
          },
          {
            "name": "IChatPreferences",
            "type": "interface"
          },
          {
            "name": "TranslateMode",
            "type": "type"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_user",
            "type": "constant"
          },
          {
            "name": "collab_minus",
            "type": "constant"
          },
          {
            "name": "collab_ban",
            "type": "constant"
          },
          {
            "name": "collab_dot",
            "type": "constant"
          },
          {
            "name": "collab_message",
            "type": "constant"
          },
          {
            "name": "collab_bell",
            "type": "constant"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "todos": [],
    "securityWarnings": [],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [],
    "i18nWarnings": [],
    "performanceHints": []
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Settings component for collaborative messaging system allowing users to manage profile, chat preferences and notification settings",
      "businessCapabilities": [
        "User profile management (view and edit username, avatar, status)",
        "Chat preferences configuration (translation mode, preferred language)",
        "Browser notification management (enable/disable, audio settings)",
        "Thread maintenance selection"
      ],
      "technicalCapabilities": [
        "Lit-based web component with TypeScript",
        "State management using lit decorators (@state, @property)",
        "IndexedDB integration for local data persistence",
        "Browser Notification API integration",
        "Internationalization support (English and Portuguese)",
        "Real-time avatar refresh from parent component",
        "Form validation and error handling"
      ],
      "implementedFeatures": [
        "Display user profile with avatar, username, user ID and status",
        "Edit username with validation (non-empty check)",
        "Select translation mode from dropdown (none, icon, text, iconText, trace)",
        "Input preferred language",
        "Enable browser notifications with permission handling",
        "Toggle notification sounds",
        "Refresh avatar from collab-init-100554 element",
        "Save user profile to backend via mls.api.msgUpdateUserDetails",
        "Save chat preferences to local storage",
        "Display success/error messages for operations"
      ],
      "constraints": [
        "Requires browser Notification API support for notification features",
        "Depends on collab-init-100554 element for avatar refresh functionality",
        "Depends on mls.api for backend communication",
        "Uses IndexedDB for local thread and user data storage",
        "Translation mode limited to predefined options: none, icon, text, iconText, trace"
      ]
    }
  }
}
    