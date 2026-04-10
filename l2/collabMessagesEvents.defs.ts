/// <mls fileReference="_102025_/l2/collabMessagesEvents.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesEvents.ts",
    "componentType": "tool",
    "componentScope": "editor"
  },
  "references": {
    "imports": [
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "ExecutionContext",
            "type": "interface"
          },
          {
            "name": "Thread",
            "type": "interface"
          },
          {
            "name": "Message",
            "type": "interface"
          },
          {
            "name": "TaskData",
            "type": "interface"
          },
          {
            "name": "MessagePerformanceCache",
            "type": "interface"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Event dispatching utilities for collaboration messages, tasks, and threads using CustomEvent API",
      "businessCapabilities": [],
      "technicalCapabilities": [
        "Dispatch custom events for message-send",
        "Dispatch custom events for task-change",
        "Dispatch custom events for task-completed",
        "Dispatch custom events for thread-change",
        "Dispatch custom events for message-change",
        "Dispatch custom events for thread-notification",
        "Dispatch custom events for thread-create",
        "Dispatch custom events for task-details-close",
        "Dispatch custom events for task-details-click",
        "Dispatch custom events for thread-open"
      ],
      "implementedFeatures": [
        "notifyMessageSendChange function",
        "notifyTaskChange function",
        "notifyTaskCompleted function",
        "notifyThreadChange function",
        "notifyMessageChange function",
        "notifyThreadNotification function",
        "notifyThreadCreate function",
        "dispatchDetailsTaskClose function",
        "dispatchDetailsTaskClick function",
        "dispatchThreadOpen function",
        "ICollabMessageEvent interface"
      ]
    }
  }
}
