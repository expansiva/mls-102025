/// <mls fileReference="_102025_/l2/collabMessagesRichPreviewText.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesRichPreviewText.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-text-code-102025"
    ],
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
            "name": "customElement",
            "type": "?"
          },
          {
            "name": "property",
            "type": "?"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "msg",
            "type": "?"
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
        "ref": "/_102025_/l2/collabMessagesRichTextParser.js",
        "dependencies": [
          {
            "name": "parseRichText",
            "type": "function"
          },
          {
            "name": "RichToken",
            "type": "type"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesTextCode.js"
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "Copiar código",
      "Token não reconhecido:"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Rich text preview component for chat messages with support for mentions, commands, code blocks, and formatting",
      "businessCapabilities": [
        "Render rich text messages",
        "Display user mentions with validation",
        "Display channel/thread mentions with validation",
        "Display command suggestions with validation",
        "Display help tokens with validation",
        "Render code blocks with syntax highlighting and copy functionality",
        "Render formatted text (bold, italic, strike, lists, blockquotes)",
        "Handle link rendering"
      ],
      "technicalCapabilities": [
        "Parse rich text tokens",
        "Validate entities against provided lists",
        "Dispatch custom events for user interactions",
        "Copy to clipboard functionality with fallback",
        "Internationalization support",
        "Conditional marker rendering for debugging"
      ],
      "implementedFeatures": [
        "Rich text token rendering",
        "User mention detection and validation",
        "Channel mention detection and validation",
        "Command detection and validation",
        "Help token detection and validation",
        "Code block rendering with copy button",
        "Inline code rendering",
        "Text formatting (bold, italic, strike)",
        "Ordered and unordered lists",
        "Blockquotes",
        "Link handling with security attributes",
        "Agent mention rendering",
        "Event dispatching for interactive elements"
      ]
    }
  }
}
    