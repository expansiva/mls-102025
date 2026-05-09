/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewFlexible.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTaskPreviewFlexible.ts",
    "componentType": "pluginUI",
    "componentScope": "appFrontEnd",
    "group": "enhancement"
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
            "name": "repeat",
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
        "ref": "/\\_102025_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class"
          }
        ]
      }
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Plugin Task Preview Flexible Component",
      "businessCapabilities": [
        "Displays task preview with flexible mode",
        "Provides tabs for info, flexible, and result views",
        "Renders step, task, and message details"
      ],
      "technicalCapabilities": [
        "Uses Lit for rendering",
        "Manages component properties and state",
        "Handles tab switching and conditional rendering"
      ],
      "implementedFeatures": [
        "Tab header with buttons for Info and Flexible",
        "Render modes for flexible, info, and result",
        "Display step status, task details, message JSON",
        "Render flexible result as image or JSON",
        "List next steps in result mode"
      ]
    }
  }
}
    