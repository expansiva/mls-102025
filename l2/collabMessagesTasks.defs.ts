/// <mls fileReference="_102025_/l2/collabMessagesTasks.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTasks.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "devFidelity": "scaffold"
  },
  "references": {
    "webComponents": [
      "collab-messages-tasks-102025"
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
            "name": "state",
            "type": "function"
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
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_spinner_clock",
            "type": "constant"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Task list and details view component for collab messages.",
      "businessCapabilities": [
        "Display tasks by stage",
        "Show task details"
      ],
      "technicalCapabilities": [
        "LitElement-based web component",
        "State management with @state decorators",
        "Conditional rendering based on state"
      ],
      "implementedFeatures": [
        "Task list rendering",
        "Task details rendering",
        "Stage grouping",
        "Basic navigation between list and details"
      ],
      "constraints": [
        "Hardcoded task data",
        "No external data fetching",
        "Portuguese and English mixed UI strings"
      ]
    }
  }
}
    