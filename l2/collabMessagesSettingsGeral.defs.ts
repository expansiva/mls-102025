/// <mls fileReference="_102025_/l2/collabMessagesSettingsGeral.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSettingsGeral.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-settings-open-claw-102025",
      "collab-messages-settings-chat-preferences-102025",
      "collab-messages-settings-user-102025",
      "collab-messages-settings-notification-preferences-102025"
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
        "ref": "/_100554_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesSettingsOpenClaw.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesSettingsChatPreferences.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesSettingsUser.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesSettingsNotificationPreferences.js"
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "* as msg"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetUserUpdate",
            "type": "function"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "Carregando informações...",
      "Loading..."
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Organism for managing general message settings with multi-section view and i18n support.",
      "businessCapabilities": [
        "User can view and manage message-related settings",
        "Supports user, chat, notification, and connector preferences"
      ],
      "technicalCapabilities": [
        "Sectioned settings rendering based on view mode",
        "Scroll position memory per section",
        "User profile fetching via API",
        "Internationalization for loading message",
        "Event-driven navigation between sections"
      ],
      "implementedFeatures": [
        "Dynamic section rendering",
        "User profile loading",
        "i18n for loading message",
        "Scroll position save/restore",
        "Navigation between settings sections"
      ],
      "constraints": [
        "Only supports 'all','user','chat','notification','openclaw' view modes",
        "Requires user profile to render settings"
      ]
    }
  }
}
