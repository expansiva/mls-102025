/// <mls fileReference="_102025_/l2/collabMessagesThreadModal.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesThreadModal.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-thread-modal-102025",
      "collab-messages-avatar-102025"
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
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_clock_static",
            "type": "constant"
          },
          {
            "name": "collab_users",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "getDateFormated",
            "type": "function"
          },
          {
            "name": "formatTimestamp",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "dispatchThreadOpen",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "*",
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
        "ref": "/_102025_/l2/collabMessagesAvatar.js"
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Modal component for displaying a thread's details in Collab Messages.",
      "businessCapabilities": [
        "Display thread details in a modal",
        "Show thread participants and status",
        "Open thread channel"
      ],
      "technicalCapabilities": [
        "LitElement-based web component",
        "i18n support for English and Portuguese",
        "Handles mouse events for modal close",
        "Displays loading and error states"
      ],
      "implementedFeatures": [
        "Thread modal UI",
        "Avatar and thread info display",
        "Open channel button with loading state",
        "Error message display",
        "i18n message switching"
      ],
      "constraints": [
        "Only works with provided thread data",
        "Closes on mouse leave or outside click"
      ]
    }
  }
}
    