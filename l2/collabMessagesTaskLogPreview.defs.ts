/// <mls fileReference="_102025_/l2/collabMessagesTaskLogPreview.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskLogPreview.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "ai-agent-default-feedback-100554"
    ],
    "imports": [
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
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getRootAgent",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentBase.js",
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
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
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
  "codeInsights": {
    "deadCodeBlocks": [
      "//this.task = await getTask('20250917143000.1001');"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component that renders task log preview by loading AI agents and displaying their feedback",
      "businessCapabilities": [
        "Display task log preview",
        "Handle task change events",
        "Load AI agents for feedback generation",
        "Render agent-specific feedback or fallback to default feedback component"
      ],
      "technicalCapabilities": [
        "LitElement-based web component implementation",
        "Event handling for task-change events",
        "Dynamic agent loading and orchestration",
        "Conditional rendering based on agent capabilities",
        "Dynamic component importing"
      ],
      "implementedFeatures": [
        "Task change event listening and handling",
        "Dynamic AI agent loading via loadAgent",
        "Agent feedback retrieval via getFeedBack method",
        "Fallback to ai-agent-default-feedback-100554 component when agent has no feedback capability",
        "Template-based rendering with Lit HTML"
      ],
      "constraints": [
        "Requires task data with PK field for change detection",
        "Depends on agent implementing getFeedBack method or falls back to default",
        "Uses global window event listener for task-change events"
      ]
    }
  }
}
    