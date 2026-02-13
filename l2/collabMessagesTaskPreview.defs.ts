/// <mls fileReference="_102025_/l2/collabMessagesTaskPreview.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code.  


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreview.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-102025",
      "collab-messages-task-preview-agent-102025",
      "collab-messages-task-preview-clarification-102025",
      "collab-messages-task-preview-flexible-102025",
      "collab-messages-task-preview-tools-102025",
      "collab-messages-task-preview-result-102025"
    ],
    "imports": [
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getAllSteps",
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
  "codeInsights": {
    "accessibilityIssues": [
      "Navigation buttons lack aria-label attributes",
      "SVG icons lack title elements or aria-labels"
    ],
    "i18nWarnings": [
      "Hardcoded UI strings: 'Task not provided.','No steps selected.','Step not found','Not found type: renderStepDetails'"
    ],
    "performanceHints": [
      "Event listener binding mismatch: bind(this) creates new references preventing proper cleanup in disconnectedCallback",
      "Arrow function handlers recreated on every render in renderNavigation"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for previewing AI task execution steps with navigation",
      "businessCapabilities": [
        "Task execution preview and visualization",
        "Step-by-step navigation through AI workflow",
        "Multi-step progression tracking",
        "Breadcrumb navigation"
      ],
      "technicalCapabilities": [
        "Dynamic step type rendering",
        "Navigation stack management",
        "Event-driven task updates",
        "Recursive step map building",
        "Test mode with example data"
      ],
      "implementedFeatures": [
        "Previous/next step navigation",
        "Breadcrumb navigation with history",
        "Conditional step detail rendering",
        "Task change event handling",
        "Test mode initialization"
      ],
      "constraints": [
        "Requires task object with iaCompressed property",
        "Linear step progression by ID",
        "Hardcoded step type switch logic"
      ]
    }
  }
}
    