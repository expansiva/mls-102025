/// <mls fileReference="_102025_/l2/collabMessagesTaskDetails.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskDetails.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
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
    ],
    "webComponents": [
      "collab-messages-task-details-102025"
    ]
  },
  "codeInsights": {
    "todos": [],
    "securityWarnings": [
      "executeHTMLClarificationScript() dynamically creates and executes script elements from clarification content, which could lead to XSS if clarification content is not properly sanitized",
      "renderClarification() contains a debugger statement"
    ],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [],
    "i18nWarnings": [
      "Tipo de resultado desconhecido."
    ],
    "performanceHints": []
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component that renders detailed task information for AI agent interactions including clarifications, results, and step-by-step execution traces",
      "businessCapabilities": [
        "Display task details and status",
        "Render AI agent execution steps and interactions",
        "Show cost information for AI operations",
        "Handle clarification requests from AI agents",
        "Render JSON-formatted task data with syntax highlighting",
        "Display long memory context from AI agents"
      ],
      "technicalCapabilities": [
        "Lit element lifecycle management",
        "Custom event handling for task changes",
        "Dynamic script execution for clarification content",
        "Recursive rendering of nested AI payload structures",
        "Syntax highlighting for JSON display",
        "Conditional rendering based on task status"
      ],
      "implementedFeatures": [
        "Task header with PK, status and cost display",
        "Collapsible raw JSON view with syntax highlighting",
        "Task info rendering excluding compressed IA data",
        "Long memory display from iaCompressed",
        "Recursive step/interaction rendering for agent, tool, clarification, result and flexible types",
        "Direct result rendering when task is done",
        "Direct clarification rendering when pending",
        "Agent payload rendering with agent name",
        "Tool payload rendering with JSON details",
        "Clarification details with JSON display",
        "Flexible result display",
        "Interaction rendering with inputs, trace and nested payloads",
        "Dynamic script tag recreation for clarification HTML",
        "Task change event listener for live updates"
      ],
      "constraints": [
        "Requires task data with specific mls.msg.TaskData structure",
        "Depends on window event 'task-change' for updates",
        "Uses global mls namespace for type definitions",
      ]
    }
  }
}
    