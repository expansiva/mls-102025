/// <mls fileReference="_102025_/l2/collabMessagesSyncNotifications.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesSyncNotifications.ts",
    "componentType": "service",
    "componentScope": "editor",
    "devFidelity": "final"
  },
  "references": {
    "imports": [
      {
        "ref": "/_102025_/l2/collabMessagesHelper.js",
        "dependencies": [
          {
            "name": "getUserId"
          },
          {
            "name": "loadNotificationDeviceId"
          },
          {
            "name": "loadNotificationPreferencesAudio"
          },
          {
            "name": "changeFavIcon"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIndexedDB.js",
        "dependencies": [
          {
            "name": "getThread"
          },
          {
            "name": "updateThread"
          },
          {
            "name": "getMessage"
          },
          {
            "name": "addMessages"
          },
          {
            "name": "getAllThreads"
          },
          {
            "name": "addThread"
          },
          {
            "name": "getCompactUTC"
          },
          {
            "name": "updateMessage"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesEvents.js",
        "dependencies": [
          {
            "name": "notifyThreadChange"
          },
          {
            "name": "notifyMessageChange"
          },
          {
            "name": "notifyThreadNotification"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/api.js",
        "dependencies": [
          {
            "name": "msgGetMessage"
          },
          {
            "name": "msgGetThreadUpdates"
          }
        ]
      },
      {
        "ref": "/_102036_/l2/environmentContract.js",
        "dependencies": [
          {
            "name": "environment"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": [
          {
            "name": "*"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Handles sync and notification logic for collaborative message threads.",
      "businessCapabilities": [
        "Notification delivery for message threads",
        "Syncing message and thread updates"
      ],
      "technicalCapabilities": [
        "Service worker message event handling",
        "Thread and message sync with IndexedDB",
        "Notification sound playback",
        "FavIcon change on notification",
        "Thread and message update via API",
        "Notification preference handling"
      ],
      "implementedFeatures": [
        "listenToThreadEvents function for service worker messages",
        "Thread and message update background sync",
        "Notification sound and FavIcon update",
        "Thread sync queue management"
      ],
      "constraints": [
        "Only works with service worker messaging",
        "Depends on environment.notifications API",
        "Audio notification depends on user preferences"
      ]
    }
  }
}
    