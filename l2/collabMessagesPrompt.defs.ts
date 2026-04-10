/// <mls fileReference="_102025_/l2/collabMessagesPrompt.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesPrompt.ts",
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
      "collab-messages-avatar-102025"
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
          },
          {
            "name": "query",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_arrow_up_long",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "getThread",
            "type": "function"
          },
          {
            "name": "listUsers",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEmojis.js",
        "dependencies": [
          {
            "name": "emojiList",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102036_/l2/environmentContract.js",
        "dependencies": [
          {
            "name": "environment",
            "type": "service"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "msg",
            "type": "interface"
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
        "ref": "/_102025_/l2/collabMessagesAvatar.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesRichTextParser.js",
        "dependencies": [
          {
            "name": "parseInlineRichText",
            "type": "function"
          },
          {
            "name": "RichToken",
            "type": "type"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Message prompt input component with rich text preview, user and agent mentions, and emoji autocomplete",
      "businessCapabilities": [
        "Message composition",
        "User mention autocomplete",
        "Agent mention autocomplete",
        "Emoji autocomplete",
        "Rich text formatting preview",
        "Reply to message",
        "Send message"
      ],
      "technicalCapabilities": [
        "Lit-based web component",
        "IndexedDB integration for users and threads",
        "Environment integration for agents",
        "Rich text parsing and rendering",
        "Dynamic textarea auto-resizing",
        "Caret position calculation for dropdown positioning",
        "Keyboard navigation for suggestions",
        "Custom event dispatching"
      ],
      "implementedFeatures": [
        "Rich text preview overlay",
        "User mention suggestions (@)",
        "Agent mention suggestions (@@)",
        "Emoji suggestions (::)",
        "Message reply functionality",
        "Auto-resizing textarea",
        "Ctrl+Enter send shortcut",
        "Agent loading by scope"
      ],
      "constraints": [
        "Requires threadId for user loading",
        "Depends on environment.getAgents() for agent metadata",
        "Requires visualViewport API support",
        "Fixed positioning for mention dropdown"
      ]
    }
  }
}
