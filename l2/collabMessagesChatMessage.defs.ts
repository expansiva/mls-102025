/// <mls fileReference="_102025_/l2/collabMessagesChatMessage.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesChatMessage.ts",
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
      "collab-messages-task-102025",
      "collab-messages-avatar-102025",
      "collab-messages-rich-preview-text-102025",
      "collab-messages-user-modal-102025",
      "collab-messages-thread-modal-102025"
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
            "name": "nothing",
            "type": "constant"
          },
          {
            "name": "LitElement",
            "type": "class"
          },
          {
            "name": "TemplateResult",
            "type": "type"
          },
          {
            "name": "until",
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
            "name": "state",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_translate",
            "type": "constant"
          },
          {
            "name": "collab_circle_exclamation",
            "type": "constant"
          },
          {
            "name": "collab_smile",
            "type": "constant"
          },
          {
            "name": "collab_chevron_down",
            "type": "constant"
          },
          {
            "name": "collab_reply",
            "type": "constant"
          },
          {
            "name": "collab_copy",
            "type": "constant"
          },
          {
            "name": "collab_edit",
            "type": "constant"
          },
          {
            "name": "collab_delete",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "loadChatPreferences",
            "type": "function"
          },
          {
            "name": "formatTimestamp",
            "type": "function"
          },
          {
            "name": "IChatPreferences",
            "type": "interface"
          },
          {
            "name": "IMessage",
            "type": "interface"
          },
          {
            "name": "IThreadInfo",
            "type": "interface"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "getMessage",
            "type": "function"
          },
          {
            "name": "updateMessage",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgUpdateMessage",
            "type": "function"
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
      }
    ]
  },
  "codeInsights": {
    "deadCodeBlocks": [
      "// this.positionReactionListPopup();"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component for rendering individual chat messages with support for reactions, replies, translations, and AI task results",
      "businessCapabilities": [
        "Display chat messages with user info and timestamps",
        "Support message reactions with emoji",
        "Support reply to messages with preview",
        "Support message translation in multiple modes",
        "Display AI task results and footers",
        "Provide message actions: copy, reply, edit, delete",
        "Rich text preview with mentions and channel links"
      ],
      "technicalCapabilities": [
        "LitElement-based web component architecture",
        "State management via StateLitElement base class",
        "IndexedDB integration for local message storage",
        "API integration for message updates",
        "Dynamic positioning of popups and menus",
        "Caching of reply previews",
        "Internationalization support for English and Portuguese",
        "Custom event dispatching for user interactions"
      ],
      "implementedFeatures": [
        "Message rendering with user/system distinction",
        "Reaction system with add/remove/view list functionality",
        "Reply preview with click navigation",
        "Translation modes: none, icon, text, iconText, trace",
        "Message action menu with copy, reply, edit, delete",
        "AI task result display with translation support",
        "Mention and channel hover modals",
        "Message status indicators for loading and failed states",
        "Timestamp formatting based on user preferences"
      ],
      "constraints": [
        "Requires actualThread context for full functionality",
        "Depends on IndexedDB for message retrieval",
        "Requires userId for reaction and reply operations"
      ]
    }
  }
}
    