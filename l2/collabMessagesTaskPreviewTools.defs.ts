/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewTools.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewTools.ts",
    "componentType": "pluginUI",
    "componentScope": "appFrontEnd",
    "group": "enhancement",
    "languages": [
      "pt"
    ]
  },
  "references": {
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
        "ref": "/_102025_/l2/collabLitElement.js",
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
    "unusedImports": [
      "repeat"
    ],
    "deadCodeBlocks": [
      "selectTabResult",
      "renderResults"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Plugin task preview tools component",
      "businessCapabilities": [
        "Display task information",
        "Show tool arguments",
        "Render next steps"
      ],
      "technicalCapabilities": [
        "Lit web component",
        "Tab-based UI"
      ],
      "implementedFeatures": [
        "Info tab",
        "Tools tab",
        "Results rendering"
      ]
    }
  }
}
    