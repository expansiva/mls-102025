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
      "collab-messages-thread-details-102025",
      "collab-messages-change-avatar-102025",
      "collab-messages-input-tag-102025",
      "collab-messages-add-participant-102025"
    ],
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html"
          },
          {
            "name": "repeat"
          },
          {
            "name": "ifDefined"
          },
          {
            "name": "nothing"
          },
          {
            "name": "until"
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
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "updateThread"
          },
          {
            "name": "getUser"
          },
          {
            "name": "deleteAllMessagesFromThread"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_triangle_exclamation"
          },
          {
            "name": "collab_floppy_disk"
          },
          {
            "name": "collab_edit"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "notifyThreadChange"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "addMessage"
          },
          {
            "name": "loadOpenClawIntegrations"
          },
          {
            "name": "generateUUIDv7"
          },
          {
            "name": "generateAgentAvatar"
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
            "name": "StateLitElement"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetThreadUpdates"
          },
          {
            "name": "msgRemoveParticipantFromThread"
          },
          {
            "name": "msgAddOrUpdateThreadIntegration"
          },
          {
            "name": "msgAddOrUpdateThreadBot"
          },
          {
            "name": "msgAddOrUpdateThreadOpenClawAgent"
          },
          {
            "name": "msgRemoveThreadOpenClawAgent"
          },
          {
            "name": "msgUpdateThread"
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
  "codeInsights": {
    "i18nWarnings": [
      "Thread name",
      "Visibility",
      "Status",
      "Topics",
      "Welcome message",
      "Remove",
      "Disable",
      "Active",
      "Group",
      "Users",
      "Bots",
      "Agents",
      "Automatic translation in multiple languages",
      "Details",
      "For each message, the language will be detected and translated into the languages above. Leave blank to avoid spending credits.",
      "Please fill in all required fields.",
      "Invalid user ID.",
      "Save changes",
      "Add agent",
      "Cancel",
      "Edit",
      "Saved successfully",
      "No changes.",
      "Add Participant",
      "Add Agent",
      "User id or name",
      "Auth:",
      "Fill in all fields!",
      "Error on remove user",
      "Error on remove agent",
      "Agent added successfully",
      "Agent removed successfully",
      "Thread details",
      "Change avatar",
      "The thread cannot be changed when status is \"deleting\"",
      "The name must start with #",
      "Select integration",
      "Select agent",
      "No integrations found",
      "No agents in this integration",
      "All agents already added",
      "Already added",
      "Save",
      "No agents added",
      "No topics defined",
      "No languages defined",
      "No message defined"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Collab thread details organism for viewing and editing thread info, users, bots, and agents.",
      "businessCapabilities": [
        "View thread details",
        "Edit thread details",
        "Add/remove participants",
        "Add/remove agents",
        "Add/remove bots"
      ],
      "technicalCapabilities": [
        "LitElement-based web component",
        "State management with @state and @property",
        "Integration with IndexedDB",
        "Dynamic rendering based on thread type",
        "i18n support for en and pt",
        "Agent and bot management",
        "Avatar handling",
        "Async data loading"
      ],
      "implementedFeatures": [
        "Thread details view/edit",
        "User management",
        "Agent management",
        "Bot management",
        "Avatar change",
        "i18n strings",
        "Integration loading",
        "Status/visibility editing",
        "Topic/language editing"
      ],
      "constraints": [
        "Thread cannot be edited when status is 'deleting'",
        "Name must start with # for channels",
        "Languages must match pattern",
        "Topics must match pattern"
      ]
    }
  }
}
    