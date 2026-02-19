/// <mls fileReference="_102025_/l2/collabMessagesTextCode.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTextCode.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "imports": [
      {
        "ref": "/_100554_/l2/stateLitElement.js",
        "dependencies": [
          {
            "name": "StateLitElement",
            "type": "class",
            "purpose": "base class for stateful Lit elements"
          }
        ]
      },
      {
        "ref": "lit",
        "dependencies": [
          {
            "name": "html",
            "type": "function",
            "purpose": "template literal tag for Lit templates"
          },
          {
            "name": "css",
            "type": "function",
            "purpose": "template literal tag for Lit styles"
          }
        ]
      },
      {
        "ref": "lit/decorators.js",
        "dependencies": [
          {
            "name": "customElement",
            "type": "function",
            "purpose": "Lit decorator to define custom element"
          },
          {
            "name": "property",
            "type": "function",
            "purpose": "Lit decorator for reactive properties"
          },
          {
            "name": "query",
            "type": "function",
            "purpose": "Lit decorator for querying DOM elements"
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
    "securityWarnings": [
      "Dynamic script injection from CDN (cdnjs.cloudflare.com) without integrity check",
      "innerHTML assignment with unescaped content from highlight.js",
      "window as any type casting bypasses TypeScript safety",
      "ignoreUnescapedHTML: true in hljs.configure disables XSS protection"
    ],
    "unusedImports": [
      "css is imported but not used in the code block shown"
    ],
    "deadCodeBlocks": [],
    "accessibilityIssues": [
      "No aria-label or role for code block",
      "No keyboard navigation support for language selection",
      "Missing lang attribute on code element"
    ],
    "i18nWarnings": [
      "Console error message 'Error on load highlight.js. please try again' is hardcoded in English"
    ],
    "performanceHints": [
      "Highlight.js loaded from CDN on demand, no preloading",
      "Double requestAnimationFrame for marking rendered state",
      "Polling with setTimeout for script load detection (waitForLoadIfNeeded)"
    ]
  },
  "auth": {
    "view": [],
    "edit": [],
    "use": [],
    "restrictReason": ""
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for syntax-highlighted code display using highlight.js",
      "businessCapabilities": [
        "Display code with syntax highlighting",
        "Support multiple programming languages",
        "Allow language switching via property"
      ],
      "technicalCapabilities": [
        "Dynamic highlight.js loading from CDN",
        "HTML unescaping for code content",
        "Promise-based render completion notification",
        "Reactive property updates for language and text"
      ],
      "implementedFeatures": [
        "Syntax highlighting via highlight.js",
        "Language property with reflection",
        "Text content property",
        "Languages array property",
        "Code block DOM querying",
        "Render completion promise",
        "Unescape HTML utility for code content"
      ],
      "constraints": [
        "Requires highlight.js from CDN (cdnjs.cloudflare.com)",
        "Depends on global window.hljsLoaded flag",
        "TypeScript-only language default",
        "10 second timeout for script loading",
        "Polling-based load detection with 100ms intervals"
      ]
    }
  }
}
    