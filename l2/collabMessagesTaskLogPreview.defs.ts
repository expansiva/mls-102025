/// <mls fileReference="_102025_/l2/collabMessagesTaskLogPreview.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskLogPreview.ts",
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
            "name": "html",
            "type": "function"
          },
          {
            "name": "TemplateResult",
            "type": "type"
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
        "ref": "/_102025_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getRootAgent",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/aiAgentBase.js",
        "dependencies": [
          {
            "name": "IAgent",
            "type": "interface"
          },
          {
            "name": "IAgentAsync",
            "type": "interface"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "loadAgent",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102027_/l2/collabImport.js",
        "dependencies": [
          {
            "name": "collabImport",
            "type": "function"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Plugin component for task log preview",
      "businessCapabilities": [
        "Handles task change events",
        "Creates feedback for tasks"
      ],
      "technicalCapabilities": [
        "Uses Lit for rendering",
        "Extends StateLitElement",
        "Loads agents asynchronously"
      ],
      "implementedFeatures": [
        "firstUpdated",
        "disconnectedCallback",
        "render",
        "onTaskChange",
        "createFeedBack"
      ]
    }
  }
}
    