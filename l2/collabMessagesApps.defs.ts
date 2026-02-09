/// <mls fileReference="_102025_/l2/collabMessagesApps.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesApps.ts",
    "componentType": "organism",
    "componentScope": "appFrontEnd",
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-apps-menu-102025"
    ],
    "imports": [
      {
        "ref": "/_100554_/l2/libCommom.js",
        "dependencies": [
          {
            "name": "getProjectConfig",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/collabLitElement.js",
        "dependencies": [
          {
            "name": "CollabLitElement",
            "type": "class"
          }
        ]
      },
      {
        "ref": "/_100554_/l2/collabImport.js",
        "dependencies": [
          {
            "name": "collabImport",
            "type": "function"
          }
        ]
      },
      {
        "ref": "/_102025_/l2/collabMessagesAppsMenu.js"
      }
    ]
  },
  "codeInsights": {
    "securityWarnings": [
      "postMessage to window.top without targetOrigin verification"
    ],
    "i18nWarnings": [
      "Módulos"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component that renders a modular menu system for project applications",
      "businessCapabilities": [
        "Display modular application menu",
        "Load project module configurations dynamically",
        "Handle menu navigation via postMessage",
        "Support nested menu hierarchies",
        "Manage module favorites in localStorage"
      ],
      "technicalCapabilities": [
        "Dynamic module import",
        "LitElement state management",
        "Cross-window communication",
        "Project configuration retrieval"
      ],
      "implementedFeatures": [
        "Dynamic menu generation from project config",
        "Nested menu item support",
        "Module dependency resolution",
        "Menu selection event handling",
        "URL construction for module pages"
      ],
      "constraints": [
        "Requires mls.actualProject to be defined",
        "Depends on window.top for postMessage communication",
        "Assumes specific module export structure (moduleConfig)",
        "Module paths must follow specific naming conventions"
      ]
    }
  }
}
    