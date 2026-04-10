/// <mls fileReference="_102025_/l2/collabMessagesUserModal.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesUserModal.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-user-modal-102025"
    ],
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html"
          },
          {
            "name": "css"
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
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_message"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "createThreadDM"
          },
          {
            "name": "getDmThreadByUsers"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "dispatchThreadOpen"
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
        "ref": "/_102029_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement"
          }
        ]
      }
    ],
    "statesRW": [
      "ui.open",
      "ui.isLoading",
      "ui.errorMessage"
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "Carregando...",
      "Mensagem",
      "Loading...",
      "Message"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "User modal for direct messaging in Collab Messages.",
      "businessCapabilities": [
        "User direct messaging initiation",
        "User info display"
      ],
      "technicalCapabilities": [
        "LitElement-based modal component",
        "i18n support for English and Portuguese",
        "User interaction event handling",
        "Dynamic thread creation and opening"
      ],
      "implementedFeatures": [
        "User modal display",
        "User info rendering",
        "Direct message thread creation",
        "Loading and error states",
        "i18n message switching"
      ],
      "constraints": [
        "Only supports English and Portuguese for i18n",
        "Modal closes on mouse leave or outside click"
      ]
    }
  }
}
    