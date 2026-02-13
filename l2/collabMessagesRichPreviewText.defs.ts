/// <mls fileReference="_102025_/l2/collabMessagesRichPreviewText.defs.ts" enhancement="_blank" />

// Do not change – automatically generated code. 

export const asis: mls.defs.AsIs = {
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesRichPreviewText.ts",
    "componentType": "molecule",
    "componentScope": "appFrontEnd",
    "languages": [
      "en",
      "pt"
    ]
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
        "ref": "/_102025_/l2/collabMessagesTextCode.js",
        "dependencies": []
      }
    ]
  },
  "codeInsights": {
    "todos": [],
    "securityWarnings": [],
    "unusedImports": [],
    "deadCodeBlocks": [],
    "accessibilityIssues": [],
    "i18nWarnings": [],
    "performanceHints": []
  },
  "auth": {},
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component that renders Slack-style markdown with rich preview capabilities including mentions, channels, commands, code blocks, and formatted text",
      "businessCapabilities": [
        "Render Slack-compatible markdown text with rich formatting",
        "Display user mentions with validation against user list",
        "Display channel references with validation against thread list",
        "Display command references with validation against command list",
        "Display agent mentions (@@agent syntax)",
        "Render code blocks with language detection and copy-to-clipboard",
        "Render formatted text (bold, italic, strike-through)",
        "Render lists (ordered and unordered)",
        "Render blockquotes",
        "Render links (markdown-style and raw URLs)",
        "Dispatch custom events for interactive elements (mention-click, mention-hover, mention-leave, channel-click, channel-hover, channel-leave, command-click)",
        "Support internationalization (English and Portuguese)"
      ],
      "technicalCapabilities": [
        "Parse Slack markdown syntax into tokenized structure",
        "Parse inline Slack markdown for formatting",
        "Parse block-level elements (code blocks, blockquotes, lists)",
        "Token-based rendering architecture with type-safe SlackToken union type",
        "State-based message localization using getMessageKey from parent class",
        "Property-based reactive updates for text, allUsers, allThreads, allCommands, allHelpers",
        "Event dispatching for UI interactions with CustomEvent",
        "Clipboard API integration with fallback for older browsers",
        "Integration with collab-messages-text-code-102025 for syntax-highlighted code display"
      ],
      "implementedFeatures": [
        "SlackToken type definition with 13 token variants",
        "ParserState type for parsing state machine",
        "English and Portuguese i18n message dictionaries",
        "Property decorators for reactive properties",
        "Custom element registration with @customElement",
        "render() method with language detection and token parsing",
        "renderSlackTokens() recursive rendering method",
        "Individual render methods for each token type (renderText, renderBold, renderItalic, renderStrike, renderInlineCode, renderCodeBlock, renderMention, renderAgent, renderChannel, renderCommand, renderHelp, renderLink, renderRawLink, renderBlockquote, renderList)",
        "copyToClipboard() with visual feedback",
        "parseSlackMarkdown() block-level parser",
        "parseInlineSlackMarkdown() inline parser with state machine",
        "Validation logic for mentions (against allUsers), channels (against allThreads), commands (against allCommands), help (against allHelpers)",
        "Event dispatching for mention interactions (click, hover, leave)",
        "Event dispatching for channel interactions (click, hover, leave)",
        "Event dispatching for command interactions (click)",
        "CSS class application based on validation state (valid/invalid)",
        "External link handling with target=\"_blank\" and rel=\"noopener\""
      ],
      "constraints": [
        "Requires StateLitElement base class for state management and i18n",
        "Requires collab-messages-text-code-102025 component for code block rendering",
        "Mention validation depends on allUsers property being populated",
        "Channel validation depends on allThreads property being populated",
        "Command validation depends on allCommands property being populated",
        "Help validation depends on allHelpers property being populated",
        "Clipboard functionality requires navigator.clipboard API or falls back to textarea method",
        "Link rendering assumes http/https protocols, auto-prefixes www URLs"
      ]
    }
  }
}
    