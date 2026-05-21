/// <mls fileReference="_102025_/l2/collabMessagesRichTextParser.test.ts" enhancement="_blank" />

import type { ICANTest, ICANIntegration } from '/_102025_/l2/tsTestAST.js';
import { parseInlineRichText, parseRichText, RichToken } from '/_102025_/l2/collabMessagesRichTextParser.js';

export const integrations: ICANIntegration[] = [];

export const tests: ICANTest[] = [
    { functionName: 'testParseUnorderedList', params: [{}] },
    { functionName: 'testParseMultipleListItems', params: [{}] },
    { functionName: 'testParseMarkdownLink', params: [{}] },
    { functionName: 'testParseRawLink', params: [{}] },
    { functionName: 'testParseCodeFence', params: [{}] },
    { functionName: 'testParseBlockquote', params: [{}] },
    { functionName: 'testParseInlineFormatting', params: [{}] },
];

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

function firstToken(input: string): RichToken {
    const token = parseRichText(input)[0];
    assert(token, `Expected token for ${input}`);
    return token;
}

function tokenText(tokens: RichToken[]) {
    return tokens
        .filter((token): token is { type: 'text'; value: string } => token.type === 'text')
        .map(token => token.value)
        .join('');
}

export function testParseUnorderedList() {
    const token = firstToken('- item');
    assert(token.type === 'list', 'Expected unordered list token');
    assert(token.ordered === false, 'Expected unordered list');
    assert(token.items[0].marker === '-', 'Expected dash marker');
    assert(tokenText(token.items[0].children) === 'item', 'Expected list item text');
}

export function testParseMultipleListItems() {
    const token = firstToken('- item 1\n* item 2\n+ item 3');
    assert(token.type === 'list', 'Expected list token');
    assert(token.items.length === 3, 'Expected three list items');
    assert(token.items[1].marker === '*', 'Expected asterisk marker');
    assert(tokenText(token.items[2].children) === 'item 3', 'Expected third list item text');
}

export function testParseMarkdownLink() {
    const token = parseInlineRichText('[Google](https://google.com)')[0];
    assert(token.type === 'link', 'Expected markdown link token');
    assert(token.text === 'Google', 'Expected link text');
    assert(token.url === 'https://google.com', 'Expected link URL');
}

export function testParseRawLink() {
    const token = parseInlineRichText('https://collab.codes')[0];
    assert(token.type === 'raw-link', 'Expected raw link token');
    assert(token.url === 'https://collab.codes', 'Expected raw link URL');
}

export function testParseCodeFence() {
    const token = firstToken('```ts\nconst value = 1;\n```');
    assert(token.type === 'code-block', 'Expected code block token');
    assert(token.language === 'ts', 'Expected code language');
    assert(token.value === 'const value = 1;\n', 'Expected code value');
}

export function testParseBlockquote() {
    const token = firstToken('> quote');
    assert(token.type === 'blockquote', 'Expected blockquote token');
    assert(token.lines.length === 1, 'Expected one quote line');
    assert(tokenText(token.lines[0]) === 'quote', 'Expected quote text');
}

export function testParseInlineFormatting() {
    const tokens = parseInlineRichText('**bold** `code` ~~old~~');
    assert(tokens.some(token => token.type === 'bold'), 'Expected bold token');
    assert(tokens.some(token => token.type === 'inline-code'), 'Expected inline code token');
    assert(tokens.some(token => token.type === 'strike'), 'Expected strike token');
}
