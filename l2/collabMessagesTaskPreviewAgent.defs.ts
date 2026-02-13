/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewAgent.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewAgent.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-agent-102025"
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
          },
          {
            "name": "unsafeHTML",
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
        "ref": "/_100554_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
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
            "name": "loadAgent",
            "type": "function"
          },
          {
            "name": "executeBeforePrompt",
            "type": "function"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Usage of unsafeHTML for rendering trace content from step.interaction.trace"
    ],
    "unusedImports": [
      "executeBeforePrompt"
    ],
    "i18nWarnings": [
      "Info",
      "Inputs",
      "Step not Found.",
      "Not found!",
      "Agent ",
      "(in progress)",
      "Trace: ",
      "Task details",
      "Message details",
      "Advanced details",
      "Execute",
      "(run again - test)",
      "Última atualização",
      "Status: ",
      "result: Ok",
      "result: Erro",
      "Not next step",
      "No input found!"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for previewing AI agent task execution steps with tabbed interface showing info, inputs, and results",
      "businessCapabilities": [
        "Preview AI agent task execution steps",
        "View agent interaction details including trace and cost",
        "Display task metadata and status information",
        "Replay agent execution for support purposes",
        "View message details in JSON format"
      ],
      "technicalCapabilities": [
        "LitElement-based component with reactive properties",
        "Tab-based navigation between Info and Inputs views",
        "Dynamic rendering of agent prompts and interactions",
        "Agent loading and execution orchestration",
        "Context management for agent replay functionality"
      ],
      "implementedFeatures": [
        "Tab navigation between Info and Inputs modes",
        "Agent step information display including ID, name, status, and cost",
        "Trace rendering with HTML support via unsafeHTML",
        "Task details display with PK, status, last updated timestamp, and title",
        "Message JSON display in preformatted block",
        "Agent replay functionality for support with loading states",
        "Collapsible details sections using HTML details element",
        "Dynamic prompt rendering with type indicators and content truncation"
      ]
    }
  }
}
    