/// <mls fileReference="_102025_/l2/collabMessagesAvatar.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesAvatar.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
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
            "type": "function"
          },
          {
            "name": "property",
            "type": "function"
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
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_user",
            "type": "constant"
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
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Uses unsafeHTML for SVG rendering which could lead to XSS if avatar content is not properly sanitized"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for displaying user or agent avatars with support for SVG and image formats",
      "businessCapabilities": [
        "Display user/agent avatar images",
        "Display SVG-based avatars",
        "Generate fallback avatars when none provided",
        "Show placeholder icon for missing avatars"
      ],
      "technicalCapabilities": [
        "Lit web component implementation",
        "Reactive property binding",
        "CSS custom properties for dynamic sizing",
        "SVG rendering via unsafeHTML",
        "Image tag rendering",
        "Custom element registration"
      ],
      "implementedFeatures": [
        "Avatar property binding",
        "Alt text support with default fallback",
        "Width and height configuration via CSS variables",
        "SVG content detection and rendering",
        "Image source rendering",
        "Placeholder icon fallback using collab_user",
        "Dynamic style updates on property changes"
      ]
    }
  }
}
    