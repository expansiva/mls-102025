/// <mls fileReference="_102025_/l2/collabMessagesAddParticipant.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesAddParticipant.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "group": "collabMessages",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-add-participant-102025"
    ],
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html",
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
            "name": "updateUsers",
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
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgAddParticipantToThread",
            "type": "function"
          },
          {
            "name": "msgGetThreadUpdates",
            "type": "function"
          },
          {
            "name": "msgGetUsers",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_floppy_disk",
            "type": "constant"
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
      }
    ]
  },
  "codeInsights": {
    "accessibilityIssues": [
      "Input element lacks explicit id attribute for label association",
      "Label element lacks for attribute explicitly linking to input"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component for adding participants to a collaboration thread with autocomplete user search and permission selection",
      "businessCapabilities": [
        "Add participant to collaboration thread",
        "Search and select users from available list",
        "Assign permission levels to participants"
      ],
      "technicalCapabilities": [
        "LitElement-based web component implementation",
        "Autocomplete dropdown with keyboard navigation",
        "Form validation and error handling",
        "IndexedDB integration for local cache updates",
        "REST API integration for participant management",
        "Custom event dispatching",
        "Internationalization support",
        "Loading state management"
      ],
      "implementedFeatures": [
        "Real-time user filtering with suggestions dropdown",
        "Permission level selection",
        "Form submission with validation",
        "Success and error feedback messages",
        "Local cache synchronization",
        "Thread update notifications"
      ],
      "constraints": [
        "Requires actualThread and userId properties to be set",
        "All form fields must be filled before submission",
        "Suggestions dropdown closes on blur with 200ms delay"
      ]
    }
  }
}
    