/// <mls fileReference="_102025_/l2/collabMessagesTabMenu.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTabMenu.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
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
            "name": "TemplateResult",
            "type": "type"
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
      }
    ]
  },
  "codeInsights": {},
  "asIs": {
    "semantic": {
      "generalDescription": "CollabMessagesTabMenu is a Lit-based tab/button menu web component.",
      "businessCapabilities": [],
      "technicalCapabilities": [
        "Renders tab and button menu items",
        "Handles item click events",
        "Dispatches custom events for tab change and button click",
        "Supports active styling for selected tab/button"
      ],
      "implementedFeatures": [
        "Tab and button filtering",
        "Active item highlighting",
        "Custom event dispatching",
        "Dynamic rendering of menu items"
      ],
      "constraints": [
        "Only items of type 'tab' or 'button' are supported",
        "Active styling uses DEFAULT_ACTIVE_COLOR if not specified"
      ]
    }
  }
}
