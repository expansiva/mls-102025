/// <mls fileReference="_102025_/l2/collabMessagesTaskDetails.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskDetails.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd"
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
            "name": "query",
            "type": "function"
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
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getNextResultStep",
            "type": "function"
          },
          {
            "name": "getNextPendentStep",
            "type": "function"
          },
          {
            "name": "getNextClarificationStep",
            "type": "function"
          },
          {
            "name": "getInteractionStepId",
            "type": "function"
          },
          {
            "name": "getStepById",
            "type": "function"
          },
          {
            "name": "getTotalCost",
            "type": "function"
          },
          {
            "name": "getTemporaryContext",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "getClarification",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_money",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentBase.js",
        "dependencies": [
          {
            "name": "IAgent",
            "type": "interface"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Dynamic script execution in executeHTMLClarificationScript method may pose XSS risk if clarification content is not properly sanitized"
    ],
    "unusedImports": [
      "getTemporaryContext",
      "IAgent"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component for displaying AI task details including execution steps, interactions, clarifications, and results",
      "businessCapabilities": [
        "Display AI task details and metadata",
        "Show task execution cost",
        "Render task execution steps (agent, tool, clarification, result, flexible)",
        "Handle interactive clarifications",
        "Display raw task JSON with syntax highlighting",
        "Show long memory information",
        "Render task interaction payloads recursively",
        "Handle task change events for real-time updates"
      ],
      "technicalCapabilities": [
        "LitElement-based web component implementation",
        "Event-driven architecture with task-change listener",
        "Dynamic HTML injection and script execution for clarifications",
        "JSON syntax highlighting",
        "Recursive template rendering for nested payloads",
        "Conditional rendering based on task status"
      ],
      "implementedFeatures": [
        "Task short info display (PK, status, cost)",
        "Collapsible task details section",
        "Raw JSON view with syntax highlighting",
        "Task info rendering (excluding compressed data)",
        "Long memory display",
        "Direct result rendering for completed tasks",
        "Direct clarification rendering for pending steps",
        "Agent step rendering with details",
        "Tool step rendering with JSON payload",
        "Clarification step rendering with JSON display",
        "Flexible result step rendering",
        "Interaction rendering with inputs, trace, and nested payloads",
        "Script execution for clarification HTML content"
      ]
    }
  }
}
    