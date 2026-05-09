/// <mls fileReference="_102025_/l2/collabMessagesTaskPreview.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreview.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-agent-102025",
      "collab-messages-task-preview-clarification-102025",
      "collab-messages-task-preview-flexible-102025",
      "collab-messages-task-preview-tools-102025",
      "collab-messages-task-preview-result-102025"
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
        "ref": "/_102025_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getAllSteps",
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
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskPreviewAgent.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskPreviewClarification.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskPreviewFlexible.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskPreviewTools.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskPreviewResult.js"
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Plugin component for previewing task steps with navigation",
      "businessCapabilities": [
        "Render task steps",
        "Provide navigation between steps",
        "Display breadcrumbs"
      ],
      "technicalCapabilities": [
        "Lit web component",
        "Custom element",
        "State management with Lit decorators"
      ],
      "implementedFeatures": [
        "renderStep",
        "renderNavigation",
        "renderBreadcrumb",
        "init",
        "buildStepMap",
        "navigateToStep",
        "goBack"
      ]
    }
  }
}
    