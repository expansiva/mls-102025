/// <mls fileReference="_102025_/l2/collabMessagesPrompt.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesPrompt.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "collab-messages-avatar-102025"
    ],
    "imports": [
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
        "ref": "/_102025_/l2/collabMessagesAvatar.js"
      }
    ]
  },
  "codeInsights": {
    "performanceHints": [
      "Dynamic import of agent modules in getAgentsFiles method may impact performance if many agent files exist",
      "Caret coordinate calculation creates temporary DOM elements on each call"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based message composition component with autocomplete support for users, agents and emojis",
      "businessCapabilities": [
        "Message text input with auto-resizing textarea",
        "User mention autocomplete using @ trigger",
        "Agent mention autocomplete using @@ trigger",
        "Emoji autocomplete using :: trigger",
        "Message sending with formatted mentions"
      ],
      "technicalCapabilities": [
        "Lit web component extending StateLitElement",
        "Dynamic textarea height adjustment with min/max constraints",
        "Caret coordinate calculation for dropdown positioning",
        "Keyboard navigation for suggestion selection",
        "Regex-based text parsing for mention detection",
        "Dynamic module loading for agent discovery",
        "Visual viewport handling for mobile positioning"
      ],
      "implementedFeatures": [
        "Auto-resizing textarea with 40px minimum and 200px maximum height",
        "Mention suggestion dropdown with avatar support",
        "Ctrl+Enter keyboard shortcut for sending",
        "Scope-based agent filtering",
        "Public agent visibility filtering",
        "Thread-based user loading",
        "Custom event dispatch on textarea resize"
      ],
      "constraints": [
        "Requires threadId property to load users",
        "Agent loading requires acceptAutoCompleteAgents flag",
        "User autocomplete requires acceptAutoCompleteUser flag",
        "Agent suggestions filtered by scope when provided",
        "Only public visibility agents are shown"
      ]
    }
  }
}
    