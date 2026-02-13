/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewFlexible.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewFlexible.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-flexible-102025"
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
        "ref": "/_100554_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "Step not Found.",
      "Info",
      "Flexible",
      "Not found!",
      "Task details",
      "Message details",
      "No input found!",
      "Not found step",
      "Not next step",
      "Última atualização"
    ],
    "unusedImports": [
      "repeat"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for previewing AI task messages with tabbed interface showing info, flexible results, and execution details",
      "businessCapabilities": [
        "Display AI task step preview with status and cost information",
        "Render flexible result data including images from data URLs",
        "Display task metadata including PK, status, and title",
        "Display message details in JSON format",
        "Navigate between Info and Flexible result tabs",
        "List next execution steps and options"
      ],
      "technicalCapabilities": [
        "LitElement-based component with reactive properties",
        "Tab-based UI state management",
        "Conditional rendering based on step type and content",
        "Dynamic image rendering with figure captions",
        "JSON serialization for debugging display",
        "SVG icon integration for UI elements"
      ],
      "implementedFeatures": [
        "Tab switching between Info and Flexible views",
        "Step status indication including in-progress states",
        "Cost display for AI interactions",
        "Collapsible details sections for task and message data",
        "Data URL image rendering with styling",
        "Next steps enumeration from interaction payload"
      ],
      "constraints": [
        "Requires step data object to render content",
        "Image rendering limited to dataUrl presence in result object",
        "Fixed max-width styling for image containers",
        "Dependent on mls.msg type definitions for Message, TaskData, and AIFlexibleResultStep"
      ]
    }
  }
}
    