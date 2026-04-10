/// <mls fileReference="_102025_/l2/collabMessagesHelper.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesHelper.ts",
    "componentType": "tool",
    "componentScope": "editor",
    "devFidelity": "final",
    "languages": [
      "en",
      "pt"
    ],
    "group": "CONNECT"
  },
  "references": {
    "imports": [
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetUserUpdate"
          },
          {
            "name": "msgUpdateUserDetails"
          },
          {
            "name": "msgAddMessage"
          },
          {
            "name": "msgAddThread"
          },
          {
            "name": "msgAddParticipantToThread"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "notifyMessageSendChange"
          },
          {
            "name": "notifyThreadChange"
          },
          {
            "name": "notifyThreadCreate"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "addThread"
          },
          {
            "name": "listThreads"
          },
          {
            "name": "updateThread"
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
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Helper functions for collaborative messaging, notifications, and thread management.",
      "businessCapabilities": [
        "User notification registration and management",
        "Collaborative chat message handling",
        "Direct message thread creation",
        "User preferences and local storage management",
        "Agent integration lookup"
      ],
      "technicalCapabilities": [
        "Register and update notification tokens",
        "Send and format chat messages",
        "Create and manage threads and direct messages",
        "Persist and retrieve user and chat preferences from localStorage",
        "Internationalization for English and Portuguese",
        "Generate UUIDv7 and SVG avatars",
        "Change browser favicon for notifications"
      ],
      "implementedFeatures": [
        "Notification token registration and update",
        "Add and format chat messages",
        "Thread and DM thread creation",
        "User and chat preference storage and retrieval",
        "Internationalization (en, pt)",
        "Agent avatar SVG generation",
        "Favicon notification badge",
        "UUIDv7 generation",
        "Agent integration lookup"
      ],
      "constraints": [
        "Relies on browser localStorage for persistence",
        "Depends on external environment and API modules",
        "Supports only 'en' and 'pt' languages for i18n"
      ]
    }
  }
}
    