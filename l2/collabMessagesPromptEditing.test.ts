/// <mls fileReference="_102025_/l2/collabMessagesPromptEditing.test.ts" enhancement="_blank" />

import type { ICANIntegration, ICANTest } from '/_102025_/l2/tsTestAST.js';
import {
    applySmartNewline,
    indentSelection,
    insertText,
    makeCodeBlock,
    makeLinePrefix,
    outdentSelection,
    wrapSelection,
} from '/_102025_/l2/collabMessagesPromptEditing.js';

export const integrations: ICANIntegration[] = [];

export const tests: ICANTest[] = [
    { functionName: 'testOrderedListContinuation', params: [{}] },
    { functionName: 'testIndentedOrderedListContinuation', params: [{}] },
    { functionName: 'testBulletListContinuation', params: [{}] },
    { functionName: 'testEmptyListItemExitsList', params: [{}] },
    { functionName: 'testIndentCurrentLine', params: [{}] },
    { functionName: 'testOutdentCurrentLine', params: [{}] },
    { functionName: 'testIndentSelection', params: [{}] },
    { functionName: 'testBoldToolbarWrap', params: [{}] },
    { functionName: 'testInlineCodeToolbarWrap', params: [{}] },
    { functionName: 'testCodeBlockWithSelection', params: [{}] },
    { functionName: 'testCodeBlockWithoutSelection', params: [{}] },
    { functionName: 'testBulletToolbarPrefix', params: [{}] },
    { functionName: 'testLinkToolbarTemplate', params: [{}] },
    { functionName: 'testPastePreservesMultilineText', params: [{}] },
];

function assert(condition: unknown, message: string): asserts condition {
    if (!condition) throw new Error(message);
}

export function testOrderedListContinuation() {
    const result = applySmartNewline('1. xxx', 6, 6);
    assert(result.text === '1. xxx\n2. ', 'Expected ordered list continuation');
}

export function testIndentedOrderedListContinuation() {
    const result = applySmartNewline('  1. xxx', 8, 8);
    assert(result.text === '  1. xxx\n  2. ', 'Expected indented ordered list continuation');
}

export function testBulletListContinuation() {
    const result = applySmartNewline('- xxx', 5, 5);
    assert(result.text === '- xxx\n- ', 'Expected bullet list continuation');
}

export function testEmptyListItemExitsList() {
    const result = applySmartNewline('- ', 2, 2);
    assert(result.text === '', 'Expected empty list item to exit list');
}

export function testIndentCurrentLine() {
    const result = indentSelection('abc', 1, 1);
    assert(result.text === '  abc', 'Expected current line indentation');
}

export function testOutdentCurrentLine() {
    const result = outdentSelection('  abc', 3, 3);
    assert(result.text === 'abc', 'Expected current line outdentation');
}

export function testIndentSelection() {
    const result = indentSelection('a\nb', 0, 3);
    assert(result.text === '  a\n  b', 'Expected selected lines indentation');
}

export function testBoldToolbarWrap() {
    const result = wrapSelection('abc', 0, 3, '**', '**', 'bold');
    assert(result.text === '**abc**', 'Expected bold wrapper');
}

export function testInlineCodeToolbarWrap() {
    const result = wrapSelection('abc', 0, 3, '`', '`', 'code');
    assert(result.text === '`abc`', 'Expected inline code wrapper');
}

export function testCodeBlockWithSelection() {
    const result = makeCodeBlock('const x = 1;', 0, 12);
    assert(result.text === '```\nconst x = 1;\n```', 'Expected selected code block wrapper');
}

export function testCodeBlockWithoutSelection() {
    const result = makeCodeBlock('', 0, 0);
    assert(result.text === '```\n\n```', 'Expected empty code block template');
    assert(result.selectionStart === 4, 'Expected cursor inside empty code block');
}

export function testBulletToolbarPrefix() {
    const result = makeLinePrefix('abc', 0, 0, '- ');
    assert(result.text === '- abc', 'Expected bullet list prefix');
}

export function testLinkToolbarTemplate() {
    const result = insertText('abc', 0, 3, '[abc](https://)');
    assert(result.text === '[abc](https://)', 'Expected link template');
}

export function testPastePreservesMultilineText() {
    const result = insertText('', 0, 0, 'a\n  b\nc');
    assert(result.text === 'a\n  b\nc', 'Expected multiline paste text to be preserved');
}
