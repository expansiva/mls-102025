/// <mls fileReference="_102025_/l2/shared/api.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/shared/api.ts",
    "componentType": "tool",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "imports": [
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "ResponseBase",
            "type": "interface"
          },
          {
            "name": "RequestBase",
            "type": "interface"
          },
          {
            "name": "HttpStatus",
            "type": "constant"
          },
          {
            "name": "RequestGetUsers",
            "type": "interface"
          },
          {
            "name": "ResponseGetUsers",
            "type": "interface"
          },
          {
            "name": "RequestGetUserUpdate",
            "type": "interface"
          },
          {
            "name": "ResponseGetUserUpdate",
            "type": "interface"
          },
          {
            "name": "RequestUpdateUserDetails",
            "type": "interface"
          },
          {
            "name": "ResponseUpdateUserDetails",
            "type": "interface"
          },
          {
            "name": "RequestAddThread",
            "type": "interface"
          },
          {
            "name": "ResponseAddThread",
            "type": "interface"
          },
          {
            "name": "RequestUpdateThread",
            "type": "interface"
          },
          {
            "name": "ResponseUpdateThread",
            "type": "interface"
          },
          {
            "name": "RequestRemoveUserInThread",
            "type": "interface"
          },
          {
            "name": "ResponseRemoveUserInThread",
            "type": "interface"
          },
          {
            "name": "RequestAddUserInThread",
            "type": "interface"
          },
          {
            "name": "ResponseAddUserInThread",
            "type": "interface"
          },
          {
            "name": "RequestGetThreadUpdate",
            "type": "interface"
          },
          {
            "name": "ResponseGetThreadUpdate",
            "type": "interface"
          },
          {
            "name": "RequestGetTaskUpdate",
            "type": "interface"
          },
          {
            "name": "ResponseGetTaskUpdate",
            "type": "interface"
          },
          {
            "name": "RequestAddMessage",
            "type": "interface"
          },
          {
            "name": "ResponseAddMessage",
            "type": "interface"
          },
          {
            "name": "RequestAddMessageAI",
            "type": "interface"
          },
          {
            "name": "ResponseAddMessageAI",
            "type": "interface"
          },
          {
            "name": "RequestAddOrUpdateThreadBot",
            "type": "interface"
          },
          {
            "name": "ResponseAddOrUpdateThreadBot",
            "type": "interface"
          },
          {
            "name": "RequestAddOrUpdateThreadIntegration",
            "type": "interface"
          },
          {
            "name": "ResponseAddOrUpdateThreadIntegration",
            "type": "interface"
          },
          {
            "name": "RequestGetMessagesAfter",
            "type": "interface"
          },
          {
            "name": "ResponseGetMessagesAfter",
            "type": "interface"
          },
          {
            "name": "RequestGetMessagesBefore",
            "type": "interface"
          },
          {
            "name": "ResponseGetMessagesBefore",
            "type": "interface"
          },
          {
            "name": "RequestGetMessage",
            "type": "interface"
          },
          {
            "name": "ResponseGetMessage",
            "type": "interface"
          },
          {
            "name": "RequestUpdateMessage",
            "type": "interface"
          },
          {
            "name": "ResponseUpdateMessage",
            "type": "interface"
          },
          {
            "name": "RequestAddOrUpdateOpenClawConnector",
            "type": "interface"
          },
          {
            "name": "ResponseAddOrUpdateOpenClawConnector",
            "type": "interface"
          },
          {
            "name": "RequestRemoveOpenClawConnector",
            "type": "interface"
          },
          {
            "name": "ResponseRemoveOpenClawConnector",
            "type": "interface"
          },
          {
            "name": "RequestListOpenClawConnectors",
            "type": "interface"
          },
          {
            "name": "ResponseListOpenClawConnectors",
            "type": "interface"
          },
          {
            "name": "RequestListThreadOpenClawAgents",
            "type": "interface"
          },
          {
            "name": "ResponseListThreadOpenClawAgents",
            "type": "interface"
          },
          {
            "name": "RequestAddOrUpdateThreadOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "ResponseAddOrUpdateThreadOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "RequestRemoveThreadOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "ResponseRemoveThreadOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "RequestCreateOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "ResponseCreateOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "RequestDeleteOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "ResponseDeleteOpenClawAgent",
            "type": "interface"
          },
          {
            "name": "RequestListOpenClawAvailableAgents",
            "type": "interface"
          },
          {
            "name": "ResponseListOpenClawAvailableAgents",
            "type": "interface"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "HTTP API client module providing typed wrapper functions for backend communication",
      "businessCapabilities": [
        "User management API operations",
        "Thread management API operations",
        "Task update retrieval",
        "Message management API operations",
        "AI message processing",
        "Thread bot configuration",
        "Thread integration management",
        "OpenClaw connector management",
        "OpenClaw agent management"
      ],
      "technicalCapabilities": [
        "Generic HTTP POST request handling",
        "Response status code validation",
        "Centralized error handling and message extraction",
        "Type-safe API result wrapping",
        "JSON request/response serialization",
        "Credential-inclusive CORS requests"
      ],
      "implementedFeatures": [
        "Generic POST request function with type parameters",
        "HandleRequest wrapper for standardized response processing",
        "Error response classification for BAD_REQUEST and CONFLICT status codes",
        "User-related endpoints (getUsers, getUserUpdate, updateUserDetails)",
        "Thread-related endpoints (addThread, updateThread, removeParticipantFromThread, addParticipantToThread, getThreadUpdates)",
        "Task-related endpoints (getTaskUpdate)",
        "Message-related endpoints (addMessage, addMessageAI, getMessagesAfter, getMessagesBefore, getMessage, updateMessage)",
        "Bot management endpoints (addOrUpdateThreadBot)",
        "Integration management endpoints (addOrUpdateThreadIntegration)",
        "OpenClaw connector endpoints (addOrUpdate, remove, list)",
        "OpenClaw agent endpoints (list, addOrUpdate, remove, create, delete, listAvailable)"
      ]
    }
  }
}
