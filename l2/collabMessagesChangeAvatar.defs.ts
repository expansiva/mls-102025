/// <mls fileReference="_102025_/l2/collabMessagesChangeAvatar.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesChangeAvatar.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ]
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
            "type": "?"
          },
          {
            "name": "property",
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
        "ref": "/_100554_/l2/aiAgentBase.js",
        "dependencies": [
          {
            "name": "IAgent",
            "type": "interface"
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
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "defaultThreadImage",
            "type": "constant"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Component uses unsafeHTML to render SVG content which requires trusted input to prevent XSS"
    ],
    "deadCodeBlocks": [
      "Message key saveButton defined in i18n objects but not referenced in render method",
      "Change image button anchor has inline style display:none"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Web component for changing thread/user avatars with AI generation and file upload",
      "businessCapabilities": [
        "Change avatar",
        "Generate avatar with AI",
        "Upload image file",
        "Describe avatar for AI generation",
        "Cancel operation"
      ],
      "technicalCapabilities": [
        "LitElement web component implementation",
        "AI agent orchestration integration",
        "File upload handling",
        "SVG and image rendering",
        "Custom event dispatching",
        "State management with lit decorators",
        "Internationalization support"
      ],
      "implementedFeatures": [
        "AI avatar generation via agent _102025_agentGenerateAvatarSvg",
        "File-based avatar upload with preview",
        "Support for SVG and image avatar formats",
        "Modal panel for AI generation interface",
        "Loading state with spinner during generation",
        "Cancel functionality to close panel"
      ],
      "constraints": [
        "Requires AI agent _102025_agentGenerateAvatarSvg",
        "Hardcoded default userId: 20250417120841.1000",
        "Hardcoded default threadId: 20250825143728.1000",
        "Uses unsafeHTML for SVG rendering"
      ]
    }
  }
}
    