/// <mls fileReference="_102025_/l2/collabMessagesTextCode.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTextCode.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "imports": [
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html"
          },
          {
            "name": "css"
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
          {
            "name": "customElement"
          },
          {
            "name": "property"
          },
          {
            "name": "query"
          }
        ]
      },
      {
        "ref": "/_102029_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Web component for displaying syntax-highlighted code blocks with language selection.",
      "businessCapabilities": [],
      "technicalCapabilities": [
        "Syntax highlighting for code blocks",
        "Dynamic language selection for highlighting",
        "Loads highlight.js dynamically if needed",
        "Unescapes HTML entities in code text",
        "Reflects language and text properties to attributes"
      ],
      "implementedFeatures": [
        "Custom element registration",
        "Property and query decorators for state management",
        "Dynamic script loading for highlight.js",
        "HTML entity unescaping",
        "Highlight.js integration for syntax highlighting",
        "Promise-based rendering completion notification"
      ],
      "constraints": [
        "Depends on highlight.js CDN for syntax highlighting",
        "Requires highlight.js to be loaded before highlighting",
        "Only highlights if code block and language are set"
      ]
    }
  }
}
    