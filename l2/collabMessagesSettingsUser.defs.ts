/// <mls fileReference="_102025_/l2/collabMessagesSettingsUser.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSettingsUser.ts",
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
        "ref": "/_102029_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "updateUsers",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetUserUpdate",
            "type": "function"
          },
          {
            "name": "msgUpdateUserDetails",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "*",
            "type": "?"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_user",
            "type": "?"
          },
          {
            "name": "collab_minus",
            "type": "?"
          },
          {
            "name": "collab_ban",
            "type": "?"
          },
          {
            "name": "collab_dot",
            "type": "?"
          },
          {
            "name": "collab_edit",
            "type": "?"
          },
          {
            "name": "collab_xmark",
            "type": "?"
          },
          {
            "name": "collab_floppy_disk",
            "type": "?"
          },
          {
            "name": "collab_check",
            "type": "?"
          },
          {
            "name": "collab_chevron_left",
            "type": "?"
          }
        ]
      }
    ],
    "statesRW": [
      "ui.viewMode",
      "ui.isSaving",
      "ui.labelOk",
      "ui.labelError",
      "ui.tempAvatarUrl",
      "ui.avatarUrlValid",
      "ui.avatarLoading",
      "ui.userPerfil"
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "User name cannot be empty",
      "User profile updated successfully",
      "Invalid URL or image not found",
      "Nome do usuário não pode ser vazio",
      "Perfil do usuário atualizado com sucesso",
      "URL inválida ou imagem não encontrada"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "User profile settings component with avatar editing and i18n support.",
      "businessCapabilities": [
        "User profile editing",
        "Avatar URL update"
      ],
      "technicalCapabilities": [
        "LitElement web component",
        "i18n (English/Portuguese)",
        "Avatar URL validation and preview",
        "State management with @state",
        "Custom events for user save",
        "Integration with IndexedDB"
      ],
      "implementedFeatures": [
        "User name editing",
        "Avatar URL editing and validation",
        "Status display",
        "Save/cancel actions",
        "i18n message switching",
        "Success/error feedback"
      ],
      "constraints": [
        "Only English and Portuguese supported for i18n",
        "Avatar URL must be valid and image must load",
        "User name cannot be empty"
      ]
    }
  }
}
