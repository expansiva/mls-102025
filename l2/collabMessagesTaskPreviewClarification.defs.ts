/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewClarification.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewClarification.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "collab-messages-task-preview-clarification-102025"
    ],
    "imports": [
      {
        "ref": "/_100554_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class",
            "purpose": "Base class for Lit element"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getStepById",
            "type": "function",
            "purpose": "Get step by ID from task"
          },
          {
            "name": "getTemporaryContext",
            "type": "function",
            "purpose": "Create temporary context for agent"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "loadAgent",
            "type": "function",
            "purpose": "Load agent by name"
          },
          {
            "name": "executeBeforePrompt",
            "type": "function",
            "purpose": "Execute before prompt hook"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "todos": [],
    "securityWarnings": [
      "Uses unsafeHTML which can lead to XSS if content is not properly sanitized",
      "innerHTML assignment without sanitization"
    ],
    "unusedImports": [
      "executeBeforePrompt"
    ],
    "deadCodeBlocks": [
      "Commented code block setting data and mode attribute on clarificationid"
    ],
    "accessibilityIssues": [],
    "i18nWarnings": [
      "Step not Found.",
      "Not found!",
      "Clarification",
      "Info",
      "Task details",
      "Message details",
      "No input found!",
      "Not next step",
      "Última atualização"
    ],
    "performanceHints": [
      "setTimeout with 300ms delay in renderClarification",
      "Recursive getAgentBeforeStep function could cause stack issues with deep step chains"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for previewing and clarifying AI task steps with tabbed interface",
      "businessCapabilities": [
        "Display AI task step clarification details",
        "Show task and message information in collapsible sections",
        "Render agent clarification UI dynamically",
        "Navigate between info, clarification, and result tabs",
        "Display step status, cost, and next steps"
      ],
      "technicalCapabilities": [
        "Lit element with reactive properties and state",
        "Dynamic tab switching between info/clarification/result views",
        "Recursive step lookup for agent resolution",
        "Dynamic component injection via unsafeHTML",
        "Collapsible details sections with custom summary rendering"
      ],
      "implementedFeatures": [
        "Tab-based navigation with active state styling",
        "Info tab with step, task, and message details",
        "Clarification tab with dynamic agent UI injection",
        "Results tab showing next steps and payload options",
        "Recursive agent lookup from step chain",
        "Custom collapsible details with SVG chevron icon"
      ],
      "constraints": [
        "Requires step and task data to render",
        "Uses unsafeHTML requiring trusted content",
        "Fixed 300ms timeout for DOM manipulation",
        "Recursive function limited by step depth"
      ]
    }
  }
}
    