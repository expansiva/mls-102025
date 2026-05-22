/// <mls fileReference="_102025_/l2/collabMessagesPromptEditing.ts" enhancement="_blank" />

export interface EditResult {
    text: string;
    selectionStart: number;
    selectionEnd: number;
}

interface LineInfo {
    start: number;
    end: number;
    text: string;
}

interface ListMarker {
    indent: string;
    marker: string;
    spacing: string;
    content: string;
    ordered: boolean;
}

export function getLineInfo(text: string, cursor: number): LineInfo {
    const safeCursor = Math.max(0, Math.min(cursor, text.length));
    const lineStart = text.lastIndexOf('\n', Math.max(0, safeCursor - 1)) + 1;
    const nextBreak = text.indexOf('\n', safeCursor);
    const lineEnd = nextBreak === -1 ? text.length : nextBreak;

    return {
        start: lineStart,
        end: lineEnd,
        text: text.slice(lineStart, lineEnd),
    };
}

export function replaceRange(text: string, start: number, end: number, value: string, cursorOffset = value.length): EditResult {
    const selectionStart = start + cursorOffset;

    return {
        text: text.slice(0, start) + value + text.slice(end),
        selectionStart,
        selectionEnd: selectionStart,
    };
}

export function insertText(text: string, selectionStart: number, selectionEnd: number, value: string, cursorOffset = value.length): EditResult {
    return replaceRange(text, selectionStart, selectionEnd, value, cursorOffset);
}

export function getListMarker(line: string): ListMarker | undefined {
    const match = line.match(/^(\s*)([-+*]|\d+\.)(\s+)(.*)$/);
    if (!match) return undefined;

    return {
        indent: match[1],
        marker: match[2],
        spacing: match[3],
        content: match[4],
        ordered: /^\d+\.$/.test(match[2]),
    };
}

export function getNextListPrefix(marker: ListMarker): string {
    if (!marker.ordered) return `${marker.indent}${marker.marker}${marker.spacing}`;

    const nextNumber = Number(marker.marker.slice(0, -1)) + 1;
    return `${marker.indent}${nextNumber}.${marker.spacing}`;
}

export function applySmartNewline(text: string, selectionStart: number, selectionEnd: number): EditResult {
    const line = getLineInfo(text, selectionStart);
    const marker = getListMarker(line.text);

    if (!marker) {
        if (line.text.trim() === '```') {
            return insertText(text, selectionStart, selectionEnd, '\n\n```', 1);
        }

        return insertText(text, selectionStart, selectionEnd, '\n');
    }

    if (marker.content.trim() === '') {
        const replacement = marker.indent;
        return replaceRange(text, line.start, line.end, replacement, replacement.length);
    }

    return insertText(text, selectionStart, selectionEnd, `\n${getNextListPrefix(marker)}`);
}

export function indentSelection(text: string, selectionStart: number, selectionEnd: number): EditResult {
    return updateSelectedLines(text, selectionStart, selectionEnd, line => `  ${line}`, 2);
}

export function outdentSelection(text: string, selectionStart: number, selectionEnd: number): EditResult {
    return updateSelectedLines(text, selectionStart, selectionEnd, line => line.replace(/^ {1,2}/, ''), -2);
}

export function wrapSelection(
    text: string,
    selectionStart: number,
    selectionEnd: number,
    before: string,
    after: string,
    placeholder = ''
): EditResult {
    const selected = text.slice(selectionStart, selectionEnd);
    const value = selected || placeholder;
    const inserted = `${before}${value}${after}`;
    const cursorOffset = selected ? inserted.length : before.length + value.length;
    return insertText(text, selectionStart, selectionEnd, inserted, cursorOffset);
}

export function makeCodeBlock(text: string, selectionStart: number, selectionEnd: number): EditResult {
    const selected = text.slice(selectionStart, selectionEnd);
    if (selected) {
        const block = `\`\`\`\n${selected}\n\`\`\``;
        return insertText(text, selectionStart, selectionEnd, block);
    }

    return insertText(text, selectionStart, selectionEnd, '```\n\n```', 4);
}

export function makeLinePrefix(text: string, selectionStart: number, selectionEnd: number, prefix: string): EditResult {
    const line = getLineInfo(text, selectionStart);
    const hasSelection = selectionStart !== selectionEnd;
    const start = hasSelection ? getLineInfo(text, selectionStart).start : line.start;
    const end = hasSelection ? getLineInfo(text, selectionEnd).end : line.end;
    const selected = text.slice(start, end);
    const replacement = selected
        .split('\n')
        .map(lineText => lineText.trim() ? `${prefix}${lineText}` : prefix)
        .join('\n');

    return replaceRange(text, start, end, replacement, replacement.length);
}

function updateSelectedLines(
    text: string,
    selectionStart: number,
    selectionEnd: number,
    transform: (line: string) => string,
    cursorDelta: number
): EditResult {
    const startLine = getLineInfo(text, selectionStart);
    const endLine = getLineInfo(text, selectionEnd);
    const start = startLine.start;
    const end = selectionStart === selectionEnd ? startLine.end : endLine.end;
    const original = text.slice(start, end);
    const replacement = original.split('\n').map(transform).join('\n');
    const newSelectionStart = Math.max(start, selectionStart + cursorDelta);
    const newSelectionEnd = Math.max(newSelectionStart, selectionEnd + (replacement.length - original.length));

    return {
        text: text.slice(0, start) + replacement + text.slice(end),
        selectionStart: newSelectionStart,
        selectionEnd: selectionStart === selectionEnd ? newSelectionStart : newSelectionEnd,
    };
}
