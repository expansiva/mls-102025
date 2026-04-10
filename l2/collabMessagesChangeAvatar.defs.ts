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
    "webComponents": [
      "collab-messages-change-avatar-102025"
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
            "name": "unsafeHTML",
            "type": "function"
          },
          {
            "name": "nothing",
            "type": "constant"
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
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "generateAgentAvatar",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102036_/l2/environmentContract.js",
        "dependencies": [
          {
            "name": "environment",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102029_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Uses unsafeHTML for SVG rendering without explicit sanitization, potential XSS vulnerability"
    ],
    "accessibilityIssues": [
      "Anchor tags used as buttons without role='button' or keyboard event handlers",
      "File upload feature is hidden (display:none) making it inaccessible to users"
    ],
    "performanceHints": [
      "Object URL created in onFileSelect but never revoked, potential memory leak"
    ],
    "deadCodeBlocks": [
      "File upload trigger button has display:none, making triggerFileInput method unreachable"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component for changing user avatars with AI generation capability",
      "businessCapabilities": [
        "Change user avatar image",
        "Generate AI-powered SVG avatars from text descriptions",
        "Upload custom avatar images from local files"
      ],
      "technicalCapabilities": [
        "LitElement-based web component implementation",
        "SVG rendering using unsafeHTML directive",
        "File API integration for image upload",
        "Custom event dispatching for value changes",
        "Integration with environment agents for AI generation",
        "Internationalization support for English and Portuguese",
        "State management using Lit decorators"
      ],
      "implementedFeatures": [
        "Avatar preview display supporting SVG and image formats",
        "File input for custom avatar upload",
        "AI generation panel with text prompt input",
        "Loading state indicator during AI generation",
        "Cancel and save actions",
        "Conditional AI feature based on environment configuration"
      ],
      "constraints": [
        "AI avatar generation requires environment.config.generateSvgAvatarEnabled() to return true",
        "Default userId and threadId values are hardcoded",
        "File upload UI element has inline style display:none",
        "File input restricted to image/* mime types"
      ]
    }
  }
}
    