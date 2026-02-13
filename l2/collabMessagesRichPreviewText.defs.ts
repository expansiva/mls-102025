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
    ],
    "devFidelity": "final"
  },
  "references": {
    "webComponents": [
      "collab-messages-text-code-102025"
    ],
    "imports": [
      {
        "ref": "/_100554_/l2/stateLitElement.js"
      },
      {
        "ref": "/_102025_/l2/collabMessagesTextCode.js"
      }
    ]
  },
  "codeInsights": {
    "i18nWarnings": [
      "title=\"Copiar código\""
    ]
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Lit-based web component that renders Slack-style markdown with rich preview support including mentions, channels, commands, code blocks, and formatted text",
      "businessCapabilities": [
        "Render Slack-compatible markdown text with rich formatting",
        "Display user mentions with validation and interaction events",
        "Display channel references with validation and interaction events",
        "Display command references with validation",
        "Display help references with validation",
        "Render code blocks with syntax highlighting and copy-to-clipboard functionality",
        "Render formatted text including bold, italic, strike-through",
        "Render lists (ordered and unordered) and blockquotes",
        "Handle internationalization for copy button states"
      ],
      "technicalCapabilities": [
        "Parse Slack-style markdown syntax into tokenized AST",
        "Render tokens as Lit HTML templates",
        "Dispatch custom events for user interactions (mention-click, mention-hover, mention-leave, channel-click, channel-hover, channel-leave, command-click)",
        "Support inline code and multi-line code blocks",
        "Support markdown links and raw URL auto-linking",
        "Support agent mentions with @@ prefix",
        "Two-pass parsing: block-level then inline-level",
        "Clipboard API integration with fallback for older browsers"
      ],
      "implementedFeatures": [
        "SlackToken type definition for AST nodes",
        "Block-level parsing for code blocks, blockquotes, lists, and plain text",
        "Inline parsing for formatting, mentions, channels, commands, help, links, code",
        "User mention validation against allUsers property",
        "Channel validation against allThreads property",
        "Command validation against allCommands property",
        "Help validation against allHelpers property",
        "Copy-to-clipboard for code blocks with visual feedback",
        "Mouse event handling for mentions and channels (click, hover, leave)",
        "Default sample text demonstrating all formatting features"
      ],
      "constraints": [
        "Mentions require exact case-insensitive name match in allUsers array",
        "Channels require exact name match (including # prefix) in allThreads array",
        "Commands must match full command string (including / prefix) in allCommands array",
        "Help tokens must match full string (including ? prefix) in allHelpers array",
        "Code blocks limited to single backtick fence syntax",
        "Raw links auto-detected only for http/https/www prefixes",
        "Clipboard copy uses deprecated document.execCommand fallback"
      ]
    }
  }
}
    