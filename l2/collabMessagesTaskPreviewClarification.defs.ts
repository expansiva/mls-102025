/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewClarification.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewClarification.ts",
    "componentType": "pluginUI",
    "componentScope": "appFrontEnd",
    "group": "enhancement"
  },
  "references": {
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html"
          },
          {
            "name": "unsafeHTML"
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
        "ref": "/_102025_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getStepById"
          },
          {
            "name": "getTemporaryContext"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/aiAgentBase.js",
        "dependencies": [
          {
            "name": "IAgent"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "PluginTaskPreviewClarification component",
      "businessCapabilities": [
        "Preview task clarification",
        "Display step details",
        "Render clarification UI"
      ],
      "technicalCapabilities": [
        "Lit web component",
        "Custom element",
        "State management"
      ],
      "implementedFeatures": [
        "Tab-based UI for info, clarification, results",
        "Dynamic rendering of clarification"
      ]
    }
  }
}
    