/// <mls fileReference="_102025_/l2/collabMessagesUserModal.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesUserModal.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ]
  },
  "references": {
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
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_message",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "createThreadDM",
            "type": "function"
          },
          {
            "name": "getDmThreadByUsers",
            "type": "function"
          }
        ]
      }
    ],
    "statesRO": [],
    "statesRW": [],
    "statesWO": []
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
      "generalDescription": "Modal component for displaying user information and initiating direct message threads",
      "businessCapabilities": [
        "Display user profile information including avatar, name, userId, and status",
        "Initiate direct message conversation with selected user",
        "Create new DM thread if one doesn't exist between users",
        "Handle loading states during thread creation",
        "Display error messages from thread operations"
      ],
      "technicalCapabilities": [
        "Lit-based web component with reactive properties",
        "Mouse event handling for modal interaction (hover, leave, click)",
        "Global mouse move detection for click-outside-to-close behavior",
        "Integration with messaging helper functions for thread management",
        "Event firing to parent level for thread navigation",
        "Conditional rendering based on user relationship (self vs other)",
        "i18n support for English and Portuguese"
      ],
      "implementedFeatures": [
        "User profile display with avatar, name, userId, and status indicator",
        "Message button to start DM conversation (hidden for self)",
        "Loading spinner during thread creation",
        "Error message display",
        "Auto-close on mouse leave or click outside",
        "Manual close via destroy method",
        "Thread existence check before creation",
        "Thread creation with CONNECT type"
      ],
      "constraints": [
        "Requires actualUserId and user properties to function",
        "Mouse leave destroys modal immediately",
        "Only creates DM threads between different users",
        "Fires events to mls.actualLevel scope",
        "Depends on mls.events and mls.actualLevel globals",
        "Uses mls.msg.User type from global namespace"
      ]
    }
  }
}
    