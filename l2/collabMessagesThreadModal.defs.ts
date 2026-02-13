/// <mls fileReference="_102025_/l2/collabMessagesThreadModal.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesThreadModal.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ],
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-avatar-102025"
    ],
    "imports": [
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
        "ref": "/_100554_/l2/libCommom.js",
        "dependencies": [
          {
            "name": "getDateFormated",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/aiAgentHelper.js",
        "dependencies": [
          {
            "name": "formatTimestamp",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_clock_static",
            "type": "constant"
          },
          {
            "name": "collab_users",
            "type": "constant"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesAvatar.js"
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "Type assertion 'as any' used with event name 'collabMessages'"
    ],
    "accessibilityIssues": [
      "Modal lacks aria-modal and role='dialog' attributes",
      "Button lacks aria-label for loading state"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Modal component for displaying message thread details and navigation",
      "businessCapabilities": [
        "Display thread metadata including name avatar user count status and last message time",
        "Navigate to thread channel via event firing",
        "Show loading state during navigation",
        "Display error messages from failed operations"
      ],
      "technicalCapabilities": [
        "Lit-based web component with reactive state management",
        "Event-driven communication with parent application via mls.events.fire",
        "Auto-close on mouse leave and outside click detection",
        "Date formatting and localization support for en and pt"
      ],
      "implementedFeatures": [
        "Thread information display with avatar",
        "User count indicator with icon",
        "Last message timestamp formatting",
        "Online status indicator",
        "Channel navigation button with loading spinner",
        "Error message display",
        "Auto-close behavior on mouse leave",
        "Global mouse move detection for outside click handling"
      ],
      "constraints": [
        "Requires mls.events.fire API for navigation",
        "Depends on mls.msg.ThreadPerformanceCache type definition",
        "Auto-closes on mouse leave or outside click",
        "Requires collab-messages-avatar-102025 web component"
      ]
    }
  }
}
    