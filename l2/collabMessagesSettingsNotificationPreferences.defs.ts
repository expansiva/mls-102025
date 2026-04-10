/// <mls fileReference="_102025_/l2/collabMessagesSettingsNotificationPreferences.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSettingsNotificationPreferences.ts",
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
            "name": "saveNotificationPreferencesAudio",
            "type": "function"
          },
          {
            "name": "loadNotificationPreferencesAudio",
            "type": "function"
          },
          {
            "name": "loadNotificationPreferences",
            "type": "function"
          },
          {
            "name": "registerToken",
            "type": "function"
          },
          {
            "name": "saveNotificationPreferences",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_bell",
            "type": "constant"
          }
        ]
      }
    ],
    "statesRO": [
      "ui.msg",
      "ui.notificationPreferences",
      "ui.audioEnabled",
      "ui.isSaving",
      "ui.labelOk",
      "ui.labelError"
    ],
    "statesRW": [
      "ui.msg",
      "ui.notificationPreferences",
      "ui.audioEnabled",
      "ui.isSaving",
      "ui.labelOk",
      "ui.labelError"
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "prefNotification",
      "infoNotification",
      "moreNotification",
      "notificationStatusEnabled",
      "notificationStatusFailed",
      "btnEnableNotifications",
      "soundEnable"
    ],
    "todos": [],
    "securityWarnings": [],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [],
    "performanceHints": []
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Notification preferences settings molecule for Collab Messages.",
      "businessCapabilities": [
        "User notification preference management",
        "Audio notification toggle",
        "Enable browser notifications"
      ],
      "technicalCapabilities": [
        "LitElement web component",
        "State management with @state decorator",
        "i18n support for en and pt",
        "Notification permission handling",
        "Custom events for preference changes"
      ],
      "implementedFeatures": [
        "Notification enable/disable",
        "Audio notification toggle",
        "Status feedback",
        "i18n strings",
        "Custom events"
      ],
      "constraints": [
        "Only supports 'en' and 'pt' languages",
        "Requires browser Notification API",
        "Depends on collabMessagesHelper.js and collabMessagesIcons.js"
      ]
    }
  }
}
