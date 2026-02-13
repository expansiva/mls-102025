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
            "type": "?"
          },
          {
            "name": "state",
            "type": "?"
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
  "codeInsights": {
    "accessibilityIssues": [
      "LI elements with click handlers lack button semantics and keyboard accessibility"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "CollabMessagesTasks component for displaying task lists and details",
      "businessCapabilities": [
        "Display task list with EM PROGRESSO status",
        "Display task list with REVIEW status",
        "Display task list with PENDENTE status",
        "Display task details view",
        "Navigate between list and detail views"
      ],
      "technicalCapabilities": [
        "Manage view state using Lit state decorator",
        "Handle click events for task selection",
        "Render conditional views based on state"
      ],
      "implementedFeatures": [
        "Task list view with three hardcoded stages",
        "Task detail view with back navigation",
        "Hardcoded task items with icons and tags",
        "Click interaction to open task details"
      ],
      "constraints": [
        "Hardcoded Portuguese UI strings",
        "Hardcoded task data",
        "In development placeholder in details view"
      ]
    }
  }
}
    