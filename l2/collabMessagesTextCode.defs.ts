/// <mls fileReference="_102025_/l2/collabMessagesTextCode.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 


export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesTextCode.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd"
  },
  "references": {
    "webComponents": [
      "collab-messages-text-code-102025"
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
        "ref": "lit",
        "dependencies": [
          {
            "name": "html",
            "type": "function"
          },
          {
            "name": "css",
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
            "name": "query",
            "type": "function"
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
      "Dynamic script injection loading highlight.js from external CDN (cdnjs.cloudflare.com)",
      "Uses innerHTML assignment with unescaped HTML content",
      "ignoreUnescapedHTML: true bypasses HTML escaping protection"
    ],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [
      "No aria-label or role attributes for code block",
      "select element referenced but not rendered in template"
    ],
    "i18nWarnings": [],
    "performanceHints": [
      "Loads highlight.js from CDN on demand",
      "Repeated highlightElement call after manual highlight may be redundant",
      "waitForLoadIfNeeded uses polling with setTimeout instead of Promise-based approach"
    ]
  },
  "auth": {
    "view": [],
    "edit": [],
    "use": []
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component for syntax-highlighted code display using highlight.js",
      "businessCapabilities": [
        "Display formatted code blocks with syntax highlighting",
        "Support multiple programming languages",
        "Dynamic language switching"
      ],
      "technicalCapabilities": [
        "Integrate with highlight.js library",
        "Unescape HTML entities in code content",
        "Dynamic script loading from CDN",
        "Lit reactive property updates",
        "DOM querying for code elements"
      ],
      "implementedFeatures": [
        "Syntax highlighting via highlight.js",
        "Language property with reflection",
        "Text content property with HTML unescaping",
        "Languages array property",
        "Dynamic CDN script loading with load state tracking",
        "waitForLoadIfNeeded polling mechanism",
        "unescapeHtml helper for entity decoding",
        "setCode method for applying highlighting",
        "firstUpdated lifecycle integration"
      ],
      "constraints": [
        "Requires highlight.js CDN availability",
        "Depends on global window.hljs object",
        "Polling-based load detection with 10s timeout",
        "ignoreUnescapedHTML enabled (security consideration)"
      ]
    }
  }
}
    