/// <mls fileReference="_102025_/l2/collabMessagesSettingsChatPreferences.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSettingsChatPreferences.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "devFidelity": "final"
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
            "name": "customElement",
            "type": "function"
          },
          {
            "name": "state",
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
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "loadChatPreferences",
            "type": "function"
          },
          {
            "name": "saveChatPreferences",
            "type": "function"
          },
          {
            "name": "IChatPreferences",
            "type": "interface"
          },
          {
            "name": "TranslateMode",
            "type": "type"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_message",
            "type": "constant"
          },
          {
            "name": "collab_floppy_disk",
            "type": "constant"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "none",
      "icon",
      "text",
      "icon + text",
      "trace"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Chat preferences settings molecule with i18n support for English and Portuguese.",
      "businessCapabilities": [
        "User can set chat translation mode",
        "User can set preferred chat language",
        "User can save chat preferences"
      ],
      "technicalCapabilities": [
        "LitElement-based web component",
        "State management with @state",
        "i18n message switching",
        "Event dispatch on save",
        "Async save operation with feedback"
      ],
      "implementedFeatures": [
        "Translation mode selection",
        "Preferred language input",
        "Save button with loading state",
        "Success and error feedback",
        "i18n for UI labels"
      ],
      "constraints": [
        "Only English and Portuguese languages supported for UI labels"
      ]
    }
  }
}
