/// <mls fileReference="_102025_/l2/collabMessagesInputTag.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesInputTag.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-input-tag-102025"
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
            "name": "ifDefined",
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
            "name": "query",
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
      }
    ]
  },
  "codeInsights": {
    "accessibilityIssues": [
      "Input element lacks aria-label or associated label for screen readers"
    ],
    "performanceHints": [
      "Uses deprecated keyCode property instead of key for keyboard events"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Tag input web component for managing string tags with keyboard interaction and validation",
      "businessCapabilities": [
        "Manage collections of string tags",
        "Validate tag input against regex patterns",
        "Prevent duplicate tag entries"
      ],
      "technicalCapabilities": [
        "Handle keyboard events for tag manipulation",
        "Perform regex pattern validation",
        "Provide visual error feedback",
        "Support two-way data binding via comma-separated values"
      ],
      "implementedFeatures": [
        "Add tags via Enter key",
        "Add tags via comma key",
        "Delete last tag via Backspace when input empty",
        "Pattern-based validation with visual error indication",
        "Duplicate tag detection with visual feedback",
        "Programmatic tag management via public methods",
        "Placeholder text support",
        "Reflective error state attribute"
      ],
      "constraints": [
        "Tags serialized as comma-separated strings",
        "No maximum tag length enforcement",
        "No maximum tag count limit",
        "Depends on StateLitElement base class"
      ]
    }
  }
}
    