/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewResult.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewResult.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "pt"
    ]
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-result-102025"
    ],
    "imports": [
      {
        "ref": "/_100554_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class",
            "purpose": "base class for Lit element"
          }
        ]
      },
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html",
            "type": "function",
            "purpose": "template literal function"
          },
          {
            "name": "repeat",
            "type": "function",
            "purpose": "list rendering directive"
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
          {
            "name": "customElement",
            "type": "function",
            "purpose": "custom element registration"
          },
          {
            "name": "property",
            "type": "function",
            "purpose": "reactive property"
          },
          {
            "name": "state",
            "type": "function",
            "purpose": "internal reactive state"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "Última atualização",
      "Step not Found.",
      "Not found!",
      "Result",
      "Task details",
      "Message details",
      "Info",
      "Result (in progress)"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component displaying AI task result preview with tabbed interface for result/info views",
      "businessCapabilities": [
        "Display AI task execution results",
        "Show task metadata and status",
        "Toggle between result and information views",
        "Render step details and task progress",
        "Display message details in JSON format"
      ],
      "technicalCapabilities": [
        "Lit reactive component with @property and @state decorators",
        "Tab-based UI with mode switching",
        "Conditional rendering based on step/task/message availability",
        "SVG icon rendering for collapsible sections",
        "Date formatting with toLocaleString",
        "Dynamic class binding for active tab states"
      ],
      "implementedFeatures": [
        "Two-tab navigation (Info/Result)",
        "Collapsible details sections with summary headers",
        "Step status display with in-progress indicator",
        "Task metadata display (PK, status, last updated, title)",
        "Raw JSON message output in preformatted block",
        "Result content display with interaction payload and next steps support"
      ],
      "constraints": [
        "Requires mls.msg.Message, mls.msg.TaskData, mls.msg.AIResultStep types from global mls namespace",
        "Fixed height calculation with magic number (41px)",
        "Portuguese hardcoded string without i18n"
      ]
    }
  }
}
    