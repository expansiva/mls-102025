/// <mls fileReference="_102025_/l2/collabMessagesThreadDetails.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesThreadDetails.ts",
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
      "collab-messages-input-tag-102025",
      "collab-messages-add-participant-102025",
      "collab-messages-change-avatar-102025"
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
            "name": "repeat",
            "type": "function"
          },
          {
            "name": "ifDefined",
            "type": "function"
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
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "updateThread",
            "type": "function"
          },
          {
            "name": "getUser",
            "type": "function"
          },
          {
            "name": "deleteAllMessagesFromThread",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_triangle_exclamation",
            "type": "constant"
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
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "addMessage",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesInputTag.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesAddParticipant.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesChangeAvatar.js"
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Thread details management component for collaborative messaging system allowing configuration of thread properties, participants, and bots",
      "businessCapabilities": [
        "Manage thread metadata including name, status, visibility, and avatar",
        "Configure thread default topics and welcome messages",
        "Manage thread participants with add and remove capabilities",
        "Manage thread bots with disable functionality",
        "Configure automatic translation languages",
        "Handle thread lifecycle states including active, archived, deleted, and deleting",
        "Support distinct behaviors for direct messages, channels, and file channels"
      ],
      "technicalCapabilities": [
        "Lit-based reactive web component extending StateLitElement",
        "IndexedDB integration for local thread state persistence",
        "Real-time thread change notifications via notifyThreadChange",
        "Form validation with HTML5 pattern attributes",
        "Internationalization support for English and Portuguese",
        "REST API integration via mls.api namespace",
        "Conditional rendering based on thread type detection"
      ],
      "implementedFeatures": [
        "Thread name editing with regex pattern validation requiring # prefix for channels",
        "Status selection with active, archived, deleted options and deleting restriction",
        "Visibility configuration supporting public, private, company, and team levels",
        "Default topics input with validation pattern ^\\+[a-zA-Z0-9-]+$",
        "Welcome message textarea for channel threads",
        "Language tags input with locale pattern validation",
        "Avatar change component integration for channels",
        "Participant list rendering with user details and authorization levels",
        "Participant removal with loading state management",
        "Bot list rendering with status display",
        "Bot disabling with API integration",
        "Form dirty checking via JSON serialization comparison",
        "Automatic deletion of messages when archiving or deleting threads"
      ],
      "constraints": [
        "Thread name must start with # character for channel threads",
        "Thread details cannot be modified when status is deleting",
        "Direct message threads disable name, visibility, and avatar editing",
        "File channel threads restrict editing capabilities",
        "Topic values must match pattern ^\\+[a-zA-Z0-9-]+$",
        "Language codes must match pattern ^[a-z]{2}$|^[a-z]{2}-[A-Z]{2}$",
        "Form requires all mandatory fields before submission"
      ]
    }
  }
}
    