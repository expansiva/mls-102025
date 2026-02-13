/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewTools.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewTools.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-tools-102025"
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
            "type": "?"
          },
          {
            "name": "property",
            "type": "?"
          },
          {
            "name": "state",
            "type": "?"
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
      "Tools",
      "Not found!",
      "Tool",
      "Task details",
      "Message details",
      "No input found!",
      "Not found step",
      "Not next step",
      "Última atualização"
    ],
    "deadCodeBlocks": [
      "selectTabResult method is defined but never called",
      "renderResults method is implemented but unreachable via UI (no result tab button)",
      "'result' case in renderMode switch is unreachable"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for previewing AI task tool steps with tabbed interface showing info, tools, and results",
      "businessCapabilities": [
        "Display AI task step information",
        "Show task metadata and status",
        "Render tool arguments",
        "Display message details in JSON format",
        "Show next steps and results"
      ],
      "technicalCapabilities": [
        "Tab-based UI navigation",
        "Conditional rendering based on mode state",
        "Collapsible sections using HTML details element",
        "SVG icon rendering"
      ],
      "implementedFeatures": [
        "Info tab with step, task and message details",
        "Tools tab showing step arguments",
        "Results tab displaying next steps",
        "Tab switching functionality",
        "Collapsible sections for information display"
      ]
    }
  }
}
    