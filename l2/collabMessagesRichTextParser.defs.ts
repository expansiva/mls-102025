/// <mls fileReference="_102025_/l2/collabMessagesRichTextParser.defs.ts" enhancement="_blank"/>

export const asis: mls.defs.AsIs =
{
  "meta": {
    "fileReference": "_102025_/l2/collabMessagesRichTextParser.ts",
    "componentType": "tool",
    "componentScope": "editor",
    "devFidelity": "final"
  },
  "references": {
    "imports": []
  },
  "asIs": {
    "semantic": {
      "generalDescription": "Rich text parser for Collab messages supporting markdown-like syntax.",
      "businessCapabilities": [],
      "technicalCapabilities": [
        "Parses rich text with markdown-like formatting into token objects",
        "Supports inline and block-level formatting (bold, italic, code, lists, blockquotes, mentions, links, etc.)"
      ],
      "implementedFeatures": [
        "Tokenizes text into types: text, bold, italic, strike, inline-code, code-block, mention, agent, channel, command, help, link, raw-link, blockquote, list",
        "Handles code blocks and inline code",
        "Supports ordered and unordered lists",
        "Parses mentions, agents, channels, commands, help, links, and raw links"
      ],
      "constraints": [
        "Only processes formatting explicitly defined in the code",
        "No external dependencies",
        "No state management"
      ]
    }
  }
}
