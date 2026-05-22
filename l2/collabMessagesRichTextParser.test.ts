/// <mls fileReference="_102025_/l2/collabMessagesRichTextParser.test.ts" enhancement="_blank" />

import type { ICANTest, ICANIntegration } from '/_102025_/l2/tsTestAST.js';
import { parseInlineRichText, parseRichText, RichToken } from '/_102025_/l2/collabMessagesRichTextParser.js';

export const integrations: ICANIntegration[] = [];

export const tests: ICANTest[] = [
    { functionName: 'testParseUnorderedList', params: [{}] },
    { functionName: 'testParseOrderedList', params: [{}] },
    { functionName: 'testParseMultipleListItems', params: [{}] },
    { functionName: 'testParseNestedUnorderedList', params: [{}] },
    { functionName: 'testParseNestedOrderedList', params: [{}] },
    { functionName: 'testParseMarkdownLink', params: [{}] },
    { functionName: 'testParseRawLink', params: [{}] },
    { functionName: 'testParseCodeFence', params: [{}] },
    { functionName: 'testParseBlockquote', params: [{}] },
    { functionName: 'testParseHeading', params: [{}] },
    { functionName: 'testHashChannelIsNotHeading', params: [{}] },
    { functionName: 'testParseHorizontalRule', params: [{}] },
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

export function testParseOrderedList() {
    const token = firstToken('1. item');
    assert(token.type === 'list', 'Expected ordered list token');
    assert(token.ordered === true, 'Expected ordered list');
    assert(token.items[0].marker === '1.', 'Expected ordered marker');
    assert(tokenText(token.items[0].children) === 'item', 'Expected ordered item text');
}

export function testParseMultipleListItems() {
    const token = firstToken('- item 1\n* item 2\n+ item 3');
    assert(token.type === 'list', 'Expected list token');
    assert(token.items.length === 3, 'Expected three list items');
    assert(token.items[1].marker === '*', 'Expected asterisk marker');
    assert(tokenText(token.items[2].children) === 'item 3', 'Expected third list item text');
}

export function testParseNestedUnorderedList() {
    const token = firstToken('- parent\n  - child');
    assert(token.type === 'list', 'Expected parent list token');
    const nested = token.items[0].children.find((child): child is Extract<RichToken, { type: 'list' }> => child.type === 'list');
    assert(nested, 'Expected nested list token');
    assert(nested.ordered === false, 'Expected nested unordered list');
    assert(tokenText(nested.items[0].children) === 'child', 'Expected nested child text');
}

export function testParseNestedOrderedList() {
    const token = firstToken('1. parent\n   1. child');
    assert(token.type === 'list', 'Expected parent ordered list token');
    assert(token.ordered === true, 'Expected parent ordered list');
    const nested = token.items[0].children.find((child): child is Extract<RichToken, { type: 'list' }> => child.type === 'list');
    assert(nested, 'Expected nested ordered list token');
    assert(nested.ordered === true, 'Expected nested ordered list');
    assert(tokenText(nested.items[0].children) === 'child', 'Expected nested ordered child text');
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

export function testParseHeading() {
    const token = firstToken('## Title');
    assert(token.type === 'heading', 'Expected heading token');
    assert(token.level === 2, 'Expected h2 level');
    assert(tokenText(token.children) === 'Title', 'Expected heading text');
}

export function testHashChannelIsNotHeading() {
    const token = firstToken('#general');
    assert(token.type !== 'heading', 'Expected channel-like hash without space to stay inline');
}

export function testParseHorizontalRule() {
    const token = firstToken('---');
    assert(token.type === 'horizontal-rule', 'Expected horizontal rule token');
}

export function testParseInlineFormatting() {
    const tokens = parseInlineRichText('**bold** `code` ~~old~~');
    assert(tokens.some(token => token.type === 'bold'), 'Expected bold token');
    assert(tokens.some(token => token.type === 'inline-code'), 'Expected inline code token');
    assert(tokens.some(token => token.type === 'strike'), 'Expected strike token');
}
