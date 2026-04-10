/// <mls fileReference="_102025_/l2/collabMessagesSettingsOpenClaw.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSettingsOpenClaw.ts",
    "componentType": "organism",
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
            "name": "generateUUIDv7",
            "type": "function"
          },
          {
            "name": "generateAgentAvatar",
            "type": "function"
          },
          {
            "name": "saveOpenClawIntegrations",
            "type": "function"
          },
          {
            "name": "loadOpenClawIntegrations",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_plug",
            "type": "constant"
          },
          {
            "name": "collab_plus",
            "type": "constant"
          },
          {
            "name": "collab_trash",
            "type": "constant"
          },
          {
            "name": "collab_refresh",
            "type": "constant"
          },
          {
            "name": "collab_chevron_left",
            "type": "constant"
          },
          {
            "name": "collab_edit",
            "type": "constant"
          },
          {
            "name": "collab_xmark",
            "type": "constant"
          },
          {
            "name": "collab_floppy_disk",
            "type": "constant"
          },
          {
            "name": "collab_check",
            "type": "constant"
          },
          {
            "name": "collab_warning",
            "type": "constant"
          },
          {
            "name": "collab_robot",
            "type": "constant"
          },
          {
            "name": "collab_eye_slash",
            "type": "constant"
          },
          {
            "name": "collab_eye",
            "type": "constant"
          },
          {
            "name": "collab_copy",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgListOpenClawConnectors",
            "type": "function"
          },
          {
            "name": "msgAddOrUpdateOpenClawConnector",
            "type": "function"
          },
          {
            "name": "msgRemoveOpenClawConnector",
            "type": "function"
          },
          {
            "name": "msgCreateOpenClawAgent",
            "type": "function"
          },
          {
            "name": "msgDeleteOpenClawAgent",
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
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Settings panel for managing OpenClaw connectors and agents with CRUD operations, connection testing, and token management",
      "businessCapabilities": [
        "Manage OpenClaw connectors (create, edit, delete)",
        "Configure connector authentication (gateway token, inbound token)",
        "Test connectivity to OpenClaw servers with latency measurement",
        "Manage AI agents within connectors (create, delete)",
        "Configure agent personality (soul, identity) and appearance (avatar, emoji)",
        "Validate connector and agent configurations"
      ],
      "technicalCapabilities": [
        "Lit-based reactive web component",
        "Multi-view navigation (main, connectorDetails, editAgent)",
        "API integration for OpenClaw backend services",
        "Real-time connection testing with HTTP/SSE endpoints",
        "Token generation and clipboard operations",
        "Form validation with regex patterns",
        "Internationalization support (English, Portuguese)",
        "Modal confirmation dialogs for destructive actions"
      ],
      "implementedFeatures": [
        "Connector list with status indicators",
        "Connector configuration form (name, URL, timeout, output mode)",
        "Token management with visibility toggle and copy to clipboard",
        "Connection test with success/warning/error states",
        "Agent management interface with avatar support",
        "Delete confirmation with name verification for connectors",
        "Agent creation with workspace assignment",
        "Agent deletion with optional file cleanup"
      ],
      "constraints": [
        "Agent names must start with letter and contain only alphanumeric characters",
        "Connector timeout range: 5000ms to 300000ms",
        "Required connector fields: name, baseUrl, gatewayToken, inboundToken",
        "Required agent fields: name, workspace",
        "UserId required for all API operations"
      ]
    }
  }
}
