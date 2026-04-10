/// <mls fileReference="_102025_/l2/collabMessagesTopics.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTopics.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
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
        "ref": "/_102025_/l2/collabMessagesIcons.js",
        "dependencies": [
          {
            "name": "collab_chevron_down",
            "type": "?"
          },
          {
            "name": "collab_chevron_right",
            "type": "?"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/shared/interfaces.js",
        "dependencies": []
      },
      {
        "ref": "/_102029_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Web component for displaying and selecting message topics with grouping and expansion.",
      "businessCapabilities": [],
      "technicalCapabilities": [
        "Topic extraction from messages",
        "Topic grouping by prefix",
        "Dynamic topic selection and event dispatch",
        "Expandable/collapsible topic groups UI"
      ],
      "implementedFeatures": [
        "Topic extraction from message content",
        "+topic syntax parsing",
        "Topic grouping by prefix",
        "Header topics selection",
        "Topic selection event dispatch",
        "Expandable/collapsible UI for topics"
      ],
      "constraints": [
        "Topics must start with '+' and contain only alphanumeric or underscore characters"
      ]
    }
  }
}
    