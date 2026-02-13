/// <mls fileReference="_102025_/l2/collabMessagesTask.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTask.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ]
  },
  "references": {
    "webComponents": [
      "collab-messages-task-102025"
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
            "name": "css",
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
            "name": "getNextPendentStep",
            "type": "function"
          },
          {
            "name": "getTotalCost",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "executeNextStep",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "getTask",
            "type": "function"
          },
          {
            "name": "getMessage",
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
          },
          {
            "name": "collab_pause",
            "type": "constant"
          },
          {
            "name": "collab_bell",
            "type": "constant"
          },
          {
            "name": "collab_chevron_right",
            "type": "constant"
          },
          {
            "name": "collab_clock",
            "type": "constant"
          },
          {
            "name": "collab_check",
            "type": "constant"
          },
          {
            "name": "collab_bug",
            "type": "constant"
          },
          {
            "name": "collab_play",
            "type": "constant"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "Task"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component rendering a task card with status icon, title, cost, and execution timer for AI agent tasks",
      "businessCapabilities": [
        "Display task information including title and cost",
        "Visualize task status through icons (pending, paused, in progress, done, failed, waiting for user)",
        "Track and display elapsed time for task execution",
        "Enable continuation of task execution via continue button",
        "Handle task click events and dispatch custom events",
        "Load task data from IndexedDB",
        "Initialize execution context for AI agent tasks",
        "Support multiple languages (English and Portuguese)"
      ],
      "technicalCapabilities": [
        "LitElement-based web component with reactive state management",
        "Timer implementation using setInterval for tracking execution time",
        "Integration with IndexedDB for local task storage",
        "API integration via mls.api.msgGetTaskUpdate",
        "Conditional rendering based on task state and properties",
        "Custom event dispatching for task interactions",
        "CSS class manipulation for time-based styling",
        "Type-safe internationalization with message dictionaries"
      ],
      "implementedFeatures": [
        "Task card rendering with header containing icon, title, price and timer",
        "Dynamic status icon selection based on task state",
        "Timer display formatting as MM:SS",
        "Continue button for resuming tasks",
        "Task loading and context initialization",
        "Owner verification for task continuation eligibility",
        "Notification badge for waiting-for-user status",
        "Responsive click handling with event propagation control"
      ],
      "constraints": [
        "Requires browser environment with window.setInterval support",
        "Depends on mls.api for backend task updates",
        "Requires taskId, threadId, userId, and messageid properties to be set",
        "Timer resets when task changes or step changes",
        "Continue functionality only available when task is in progress and owned by current user"
      ]
    }
  }
}
    