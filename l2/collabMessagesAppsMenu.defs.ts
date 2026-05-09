/// <mls fileReference="_102025_/l2/collabMessagesAppsMenu.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesAppsMenu.ts",
    "componentType": "organism",
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
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
          {
            "name": "customElement",
            "type": "?"
          },
          {
            "name": "state",
            "type": "?"
          },
          {
            "name": "property",
            "type": "?"
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
  "codeInsights": {
    "accessibilityIssues": [
      "Favorite toggle uses span element instead of button",
      "Menu item click handlers attached to div elements instead of buttons or links"
    ],
    "i18nWarnings": [
      "Nenhum favorito.",
      "Erro ao ler favoritos:",
      "Favoritar"
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Menu component with favorites management for applications",
      "businessCapabilities": [
        "Manage favorite menu items per project",
        "Display hierarchical menu structure",
        "Persist favorites to localStorage",
        "Navigate menu items by click"
      ],
      "technicalCapabilities": [
        "Extend StateLitElement",
        "Use Lit HTML templates",
        "Handle localStorage operations",
        "Recursive menu rendering",
        "Event dispatching for menu selection"
      ],
      "implementedFeatures": [
        "Favorites toggle functionality",
        "Project-scoped favorites storage",
        "Hierarchical menu rendering",
        "Custom event dispatch on menu selection",
        "Local state management for menu modules and favorites"
      ],
      "constraints": [
        "Depends on localStorage for persistence",
        "Requires StateLitElement base class",
        "Hardcoded UI strings in Portuguese"
      ]
    }
  }
}
    
