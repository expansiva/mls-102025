/// <mls fileReference="_102025_/l2/collabMessagesAdd.ts" enhancement="_blank" /> 

// Do not change – automatically generated code.  

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesAdd.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "group": "COLLAB",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-input-tag-102025"
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
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "notifyThreadChange",
            "type": "function"
          },
          {
            "name": "notifyThreadCreate",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "addThread",
            "type": "function"
          },
          {
            "name": "updateThread",
            "type": "function"
          },
          {
            "name": "getUser",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "getUserId",
            "type": "function"
          },
          {
            "name": "getDmThreadByUsers",
            "type": "function"
          },
          {
            "name": "addMessage",
            "type": "function"
          },
          {
            "name": "createThreadDM",
            "type": "function"
          },
          {
            "name": "findAgentInIntegrationsByUserId",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetUsers",
            "type": "function"
          },
          {
            "name": "msgUpdateThread",
            "type": "function"
          },
          {
            "name": "msgGetThreadUpdates",
            "type": "function"
          },
          {
            "name": "msgAddOrUpdateThreadBot",
            "type": "function"
          },
          {
            "name": "msgAddThread",
            "type": "function"
          },
          {
            "name": "msgAddOrUpdateThreadOpenClawAgent",
            "type": "function"
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
            "type": "?"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesInputTag.js",
        "dependencies": [
          {
            "name": "CollabMessagesInputTag",
            "type": "component"
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
        "ref": "/_102025_/l2/collabMessagesInputTag.js"
      }
    ]
  },
  "codeInsights": {
    "unusedImports": [
      "getUser"
    ],
    "deadCodeBlocks": [
      "const agentName = '_102025_/l2/agents/agentGenerateAvatarSvg'",
      "private extractSvgFromContext(context: any): string | null { return context?.task?.iaCompressed?.nextSteps?.[0]?.interaction?.payload?.[0]?.result ?? null; }"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "LitElement web component for creating new messaging threads (DM or Channel) with configuration options for visibility, groups, bots, and AI avatars",
      "businessCapabilities": [
        "Create direct message threads between users",
        "Create public or private channel threads",
        "Configure thread visibility levels (public, private, company, team)",
        "Assign threads to business groups (CRM, TASK, DOCS, CONNECT, APPS)",
        "Enable automatic translation for multiple languages",
        "Install and configure agent bots for channels",
        "Set initial welcome messages for channels",
        "Generate AI avatars for channel threads",
        "Prevent duplicate DM thread creation"
      ],
      "technicalCapabilities": [
        "LitElement-based web component with reactive state management",
        "Form validation for required fields and patterns",
        "Integration with messaging API endpoints",
        "IndexedDB operations for local thread caching",
        "Event-driven architecture with thread change notifications",
        "Agent/bot integration for automated responses",
        "AI avatar generation via environment agents",
        "Internationalization support for English and Portuguese",
        "Dynamic user and agent loading from backend"
      ],
      "implementedFeatures": [
        "Thread type selection radio buttons (DM vs Channel)",
        "User dropdown selection for DM threads",
        "Channel name input with # prefix validation",
        "Visibility dropdown (public, private, company, team)",
        "Group dropdown (CRM, TASK, DOCS, CONNECT, APPS)",
        "Language tag input with pattern validation",
        "Collapsible bot configuration section",
        "Collapsible initial message configuration section",
        "Collapsible AI avatar generation section",
        "Form validation with error messaging",
        "Loading state management during submission",
        "Success and error notification labels",
        "Duplicate DM thread detection"
      ],
      "constraints": [
        "Channel names must start with '#' character",
        "DM threads require valid user selection from available users",
        "Cannot create duplicate DM threads with the same user",
        "Language tags must match pattern ^[a-z]{2}$ or ^[a-z]{2}-[A-Z]{2}$",
        "Bot configuration only available for channel threads",
        "AI avatar generation requires environment feature flag enabled"
      ]
    }
  }
}
    
