/// <mls fileReference="_102025_/l2/agents/agentGenerateAvatarSvg.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/agents/agentGenerateAvatarSvg.ts",
    "componentType": "agent",
    "componentScope": "editor"
  },
  "references": {
    "imports": [
      {
        "ref": "/_100554_/l2/aiAgentBase",
        "dependencies": [
          {
            "name": "IAgent",
            "type": "interface"
          },
          {
            "name": "svg_agent",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiPrompts",
        "dependencies": [
          {
            "name": "getPromptByHtml",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentHelper",
        "dependencies": [
          {
            "name": "getAgentStepByAgentName",
            "type": "function"
          },
          {
            "name": "getNextInProgressStepByAgentName",
            "type": "function"
          },
          {
            "name": "updateStepStatus",
            "type": "function"
          },
          {
            "name": "updateTaskTitle",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentOrchestration",
        "dependencies": [
          {
            "name": "startNewAiTask",
            "type": "function"
          },
          {
            "name": "executeNextStep",
            "type": "function"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "AI agent for generating SVG avatars through orchestrated task execution",
      "businessCapabilities": [
        "Generate SVG avatar images",
        "Orchestrate AI tasks for avatar creation",
        "Manage agent lifecycle with before/after prompt hooks"
      ],
      "technicalCapabilities": [
        "Initialize AI tasks with prompt retrieval",
        "Update step status and task titles",
        "Execute next steps in agent workflow",
        "Extract payload from agent step interactions"
      ],
      "implementedFeatures": [
        "Agent factory function with configuration",
        "Before prompt task initialization",
        "After prompt completion and step progression",
        "HTML-based prompt retrieval",
        "Payload extraction from flexible result types"
      ]
    }
  }
}
    