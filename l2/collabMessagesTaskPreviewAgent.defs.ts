/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewAgent.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewAgent.ts",
    "componentType": "pluginUI",
    "componentScope": "appFrontEnd",
    "group": "enhancement"
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
        "ref": "/\\_102025_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/\\_102025_/l2/aiAgentBase.js",
        "dependencies": [
          {
            "name": "IAgent",
            "type": "interface"
          }
        ]
      },
      {
        "ref": "/\\_102025_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getTemporaryContext",
            "type": "function"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Uses unsafeHTML which may introduce XSS vulnerabilities"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for previewing AI agent tasks and steps",
      "businessCapabilities": [
        "Display task details",
        "Show agent information",
        "Render input prompts",
        "Provide replay functionality for support"
      ],
      "technicalCapabilities": [
        "Renders HTML using Lit templates",
        "Manages state with Lit decorators",
        "Handles user interactions"
      ],
      "implementedFeatures": [
        "Info tab displaying agent and task details",
        "Inputs tab listing prompts",
        "Advanced details with replay button"
      ]
    }
  }
}
    