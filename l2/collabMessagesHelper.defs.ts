/// <mls fileReference="_102025_/l2/collabMessagesHelper.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesHelper.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "imports": [
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "getTemporaryContext",
            "type": "function"
          },
          {
            "name": "notifyMessageSendChange",
            "type": "function"
          },
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
        "ref": "/_100554_/l2/aiAgentOrchestration.js",
        "dependencies": [
          {
            "name": "loadAgent",
            "type": "function"
          },
          {
            "name": "executeBeforePrompt",
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
            "name": "listThreads",
            "type": "function"
          },
          {
            "name": "updateThread",
            "type": "function"
          }
        ]
      }
    ]
  },
  "codeInsights": {
    "deadCodeBlocks": [
      "checkThreadAlreadyExist function validates userId but does not implement thread existence logic"
    ],
    "i18nWarnings": [
      "Console error messages in Portuguese: 'Erro ao salvar no localStorage' and 'Erro ao carregar do localStorage'"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Helper module for collaborative messaging features including thread management, message handling with AI agent integration, and notification preferences",
      "businessCapabilities": [
        "Send messages to threads with optional AI bot invocation via @@ commands",
        "Create group and direct message threads",
        "Manage FCM push notification registration and tokens",
        "Persist chat preferences including language and translation mode",
        "Manage notification preferences including audio and permission status",
        "Retrieve and manage user identification",
        "Integrate with AI agents for bot message handling"
      ],
      "technicalCapabilities": [
        "LocalStorage CRUD operations for chat data persistence",
        "FCM token registration and device ID management",
        "AI agent loading and execution orchestration",
        "Thread existence validation and DM thread lookup by users",
        "Migration of legacy localStorage data formats",
        "Temporary context generation for bot interactions"
      ],
      "implementedFeatures": [
        "registerToken: FCM token registration with device ID generation",
        "addMessage: Message sending with @@bot command parsing and agent execution",
        "createThread: Group thread creation with API integration",
        "createThreadDM: Direct message thread creation with user addition",
        "getDmThreadByUsers: Lookup existing DM threads between two users",
        "Notification preferences management including audio, permission, and last alert time",
        "Chat preferences persistence including language, translation mode, and thread maintenance",
        "User ID management with legacy data migration",
        "Local storage abstraction with JSON serialization"
      ]
    }
  }
}
    