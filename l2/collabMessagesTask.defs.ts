/// <mls fileReference="_102025_/l2/collabMessagesTask.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTask.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "devFidelity": "final"
  },
  "references": {
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
            "name": "getTask",
            "type": "function"
          },
          {
            "name": "getMessage",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetTaskUpdate",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_money",
            "type": "?"
          },
          {
            "name": "collab_pause",
            "type": "?"
          },
          {
            "name": "collab_bell",
            "type": "?"
          },
          {
            "name": "collab_chevron_right",
            "type": "?"
          },
          {
            "name": "collab_clock",
            "type": "?"
          },
          {
            "name": "collab_check",
            "type": "?"
          },
          {
            "name": "collab_bug",
            "type": "?"
          },
          {
            "name": "collab_play",
            "type": "?"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "* as msg",
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
  "asIs": {
    "semantic": {
      "generalDescription": "Task card component for Collab messages with timer, status, and cost display.",
      "businessCapabilities": [
        "Display task summary in message threads",
        "Show task status and timer",
        "Show task cost",
        "Handle task click events"
      ],
      "technicalCapabilities": [
        "LitElement-based web component",
        "Supports i18n for English and Portuguese",
        "Fetches and syncs task data from IndexedDB and API",
        "Renders dynamic icons based on task status",
        "Implements timer logic for task steps"
      ],
      "implementedFeatures": [
        "Task card rendering",
        "Status icon rendering",
        "Timer for task steps",
        "Cost calculation and display",
        "i18n message switching",
        "Task data fetching and syncing",
        "Custom event dispatch on click"
      ],
      "constraints": [
        "Only supports 'en' and 'pt' languages as defined",
        "Minimum cost output is $0.01 if no steps",
        "Timer resets on step change or clarification",
        "No abstraction of task data structure"
      ]
    }
  }
}
    