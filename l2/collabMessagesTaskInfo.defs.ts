/// <mls fileReference="_102025_/l2/collabMessagesTaskInfo.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskInfo.ts",
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
    ],
    "webComponents": [
      "collab-messages-task-details-102025",
      "collab-messages-task-preview-102025",
      "collab-messages-task-log-preview-102025"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component that displays AI task information with tabbed interface for workflow, step, raw data and todo views, handling clarification steps with dynamic content injection",
      "businessCapabilities": [
        "Display AI task execution status and details",
        "Present task workflow visualization",
        "Show task step preview",
        "Render raw task data",
        "Display task todo/log information",
        "Handle clarification interactions with users",
        "Manage tab-based navigation for task information views"
      ],
      "technicalCapabilities": [
        "Lit reactive property binding",
        "State management via StateLitElement base class",
        "Dynamic tab switching between workflow/step/raw/todo views",
        "Clarification step detection and rendering",
        "Dynamic HTML content injection with script execution",
        "Event-driven task updates via window events",
        "Conditional rendering based on task state",
        "Parent element width manipulation"
      ],
      "implementedFeatures": [
        "Tabbed interface with workflow/step/raw/todo tabs",
        "Direct clarification view for pending clarification steps",
        "Force raw view toggle for clarification override",
        "Dynamic task details rendering via web components",
        "Task change event listening for live updates",
        "Clarification content injection with script execution support",
        "Pooling task continuation on initialization"
      ],
      "constraints": [
        "Requires task data (mls.msg.TaskData) to render",
        "Requires message data (mls.msg.Message) for full functionality",
        "Depends on parent collab-messages-chat-102025 element for width styling",
        "Clarification rendering requires DOM query for .direct-clarification .content",
        "Script execution in clarification content uses innerHTML replacement",
        "Task change events filtered by PK match"
      ]
    }
  }
}
    