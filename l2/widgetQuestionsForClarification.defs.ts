/// <mls fileReference="_102025_/l2/widgetQuestionsForClarification.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/widgetQuestionsForClarification.ts",
    "componentType": "molecule",
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
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
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
        "ref": "/_102027_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102027_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "ClarificationValue",
            "type": "type"
          },
          {
            "name": "endClarification",
            "type": "function"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Widget for questions for clarification",
      "businessCapabilities": [
        "Handle clarification questions",
        "End clarification with cancel or continue"
      ],
      "technicalCapabilities": [
        "Lit web component",
        "State management with localAnswers",
        "Form rendering for different question types"
      ],
      "implementedFeatures": [
        "Render title",
        "Render questions as boolean checkbox",
        "Render questions as MoSCoW select",
        "Render questions as range slider",
        "Render questions as open textarea",
        "Render questions as select dropdown",
        "Handle input changes",
        "Cancel button",
        "Continue button",
        "Display legends"
      ],
      "constraints": [
        "readonly property disables actions"
      ]
    }
  }
}
    