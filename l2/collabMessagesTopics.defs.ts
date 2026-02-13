/// <mls fileReference="_102025_/l2/collabMessagesTopics.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTopics.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "collab-messages-topics-102025"
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
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_chevron_down",
            "type": "constant"
          },
          {
            "name": "collab_chevron_right",
            "type": "constant"
          }
        ]
      }
    ],
    "statesRO": [],
    "statesRW": [],
    "statesWO": []
  },
  "codeInsights": {
    "todos": [],
    "securityWarnings": [],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [
      "buttons lack aria-label or aria-pressed for selected state",
      "expand/collapse icon is not keyboard accessible (div with click handler, no button or tabindex)",
      "no aria-expanded attribute on expand control"
    ],
    "i18nWarnings": [
      "hardcoded string 'all' in button"
    ],
    "performanceHints": [
      "topics recalculated on every render in render() method",
      "messages.forEach loops executed multiple times per render cycle"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for displaying and selecting message topics with expandable grouped view",
      "businessCapabilities": [
        "display message topics extracted from messages",
        "group topics by prefix",
        "allow topic selection via button click",
        "show limited header topics with expand/collapse functionality"
      ],
      "technicalCapabilities": [
        "extract topics from message content using regex pattern +[a-zA-Z0-9_]+",
        "group topics by underscore prefix",
        "render topic buttons with active state styling",
        "dispatch custom event 'topic-selected' on selection",
        "merge thread topics with extracted message topics"
      ],
      "implementedFeatures": [
        "topic extraction from message strings",
        "topic grouping by prefix",
        "expandable/collapsible topic groups",
        "header topics limited to 3 items with fallback to thread topics",
        "selected topic persistence in header",
        "custom event dispatch for topic selection"
      ],
      "constraints": [
        "topics must match pattern +[a-zA-Z0-9_]+",
        "maximum 3 topics in header view",
        "selected topic always visible in header even if not in top 3",
        "relies on parent to provide messages and threadTopics via properties"
      ]
    }
  }
}
    