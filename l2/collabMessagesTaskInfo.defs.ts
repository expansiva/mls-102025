/// <mls fileReference="_102025_/l2/collabMessagesTaskInfo.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskInfo.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-details-102025",
      "collab-messages-task-preview-102025",
      "collab-messages-task-log-preview-102025",
      "collab-messages-chat-102025"
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
            "name": "query",
            "type": "?"
          },
          {
            "name": "state",
            "type": "?"
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
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "getClarification",
            "type": "function"
          },
          {
            "name": "getClarificationElement",
            "type": "function"
          },
          {
            "name": "continuePoolingTask",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
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
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskDetails.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskPreview.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTaskLogPreview.js"
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Dynamic script injection in executeHTMLClarificationScript method"
    ],
    "i18nWarnings": [
      "No task.",
      "Todo",
      "Step",
      "Raw",
      "Workflow",
      "Clarification",
      "View raw",
      "Processing...",
      "Invalid task",
      "No found parentInteraction",
      "on task:",
      "Invalid interaction id:",
      "Invalid agent name for step id:"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement component for displaying AI task information with tabbed interface and clarification handling",
      "businessCapabilities": [
        "Display task workflow status",
        "Render task clarification requests",
        "Manage task information tabs",
        "Handle task change events",
        "Execute clarification scripts"
      ],
      "technicalCapabilities": [
        "LitElement web component implementation",
        "Conditional rendering based on task state",
        "DOM event handling",
        "Dynamic script injection",
        "Parent component width management"
      ],
      "implementedFeatures": [
        "Tabbed navigation (workflow, step, raw, todo)",
        "Direct clarification rendering",
        "Task pooling continuation",
        "Task change event listening",
        "Raw task data view",
        "Step preview rendering",
        "Todo log preview"
      ],
      "constraints": [
        "Requires parent element collab-messages-chat-102025 for full functionality",
        "Dependent on task data structure (mls.msg.TaskData)",
        "Clarification rendering requires specific task state"
      ]
    }
  }
}
    