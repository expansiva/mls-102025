/// <mls fileReference="_102025_/l2/collabMessagesRichTextParser.ts" enhancement="_102027_/l2/enhancementLit" />

// ─────────────────────────────────────────────────────────────
// Tipos de Tokens
// ─────────────────────────────────────────────────────────────

export type RichToken =
    | { type: 'text'; value: string }
    | { type: 'bold'; value: string; markerStart: string; markerEnd: string }
    | { type: 'italic'; value: string; markerStart: string; markerEnd: string }
    | { type: 'strike'; value: string; markerStart: string; markerEnd: string }
    | { type: 'inline-code'; value: string; markerStart: string; markerEnd: string }
    | { type: 'code-block'; language: string; value: string; markerStart: string; markerEnd: string }
    | { type: 'mention'; value: string; userId: string }
    | { type: 'agent'; value: string }
    | { type: 'channel'; value: string }
    | { type: 'command'; value: string }
    | { type: 'help'; value: string }
    | { type: 'link'; text: string; url: string }
    | { type: 'raw-link'; url: string }
    | { type: 'heading'; level: number; children: RichToken[] }
    | { type: 'horizontal-rule' }
    | { type: 'blockquote'; children: RichToken[]; lines: RichToken[][] }
    | { type: 'list'; ordered: boolean; items: RichListItem[] };

export interface RichListItem {
    marker: string;
    children: RichToken[];
}

type ParserState = 'NORMAL' | 'INLINE_CODE' | 'CODE_BLOCK';

// ─────────────────────────────────────────────────────────────
// Funções auxiliares
// ─────────────────────────────────────────────────────────────

const isBoundary = (char?: string): boolean => !char || /\s/.test(char);

const matchRawLink = (s: string): RegExpMatchArray | null =>
    s.match(/^(https?:\/\/[^\s]+|www\.[^\s]+)/);

const matchCodeFenceStart = (line: string): RegExpMatchArray | null =>
    line.match(/^\s{0,3}```([^`]*)$/);

const matchCodeFenceEnd = (line: string): RegExpMatchArray | null =>
    line.match(/^\s{0,3}```\s*$/);

const matchBlockquote = (line: string): RegExpMatchArray | null =>
    line.match(/^\s{0,3}>\s?(.*)$/);

const matchHeading = (line: string): RegExpMatchArray | null =>
    line.match(/^\s{0,3}(#{1,6})\s+(.+)$/);

const matchHorizontalRule = (line: string): RegExpMatchArray | null =>
    line.match(/^\s{0,3}---+\s*$/);

interface ListLine {
    indent: number;
    marker: string;
    ordered: boolean;
    content: string;
}

const matchListLine = (line: string): ListLine | undefined => {
    const match = line.match(/^(\s*)([-+*]|\d+\.)\s+(.+)$/);
    if (!match) return undefined;

    return {
        indent: match[1].length,
        marker: match[2],
        ordered: /^\d+\.$/.test(match[2]),
        content: match[3],
    };
}

function parseList(lines: string[], start: number, indent: number, ordered: boolean): { token: RichToken; nextIndex: number } {
    const items: RichListItem[] = [];
    let i = start;

    while (i < lines.length) {
        const line = matchListLine(lines[i]);
        if (!line || line.indent !== indent || line.ordered !== ordered) break;

        const children = parseInlineRichText(line.content);
        i++;

        while (i < lines.length) {
            const nextLine = matchListLine(lines[i]);
            if (!nextLine || nextLine.indent <= indent) break;

            const nested = parseList(lines, i, nextLine.indent, nextLine.ordered);
            children.push(nested.token);
            i = nested.nextIndex;
        }

        items.push({
            marker: line.marker,
            children,
        });
    }

    return {
        token: {
            type: 'list',
            ordered,
            items,
        },
        nextIndex: i,
    };
}

// ─────────────────────────────────────────────────────────────
// Parser principal - processa texto completo (com blocos)
// ─────────────────────────────────────────────────────────────

export function parseRichText(input: string): RichToken[] {
    const tokens: RichToken[] = [];
    const lines = input.split(/\r?\n/);

    let i = 0;

    while (i < lines.length) {
        const line = lines[i];

        /* ───── CODE BLOCK ───── */
        const codeFence = matchCodeFenceStart(line);
        if (codeFence) {
            const language = codeFence[1].trim();
            const codeLines: string[] = [];
            const rawLines = [line];
            let closed = false;
            i++;

            while (i < lines.length) {
                rawLines.push(lines[i]);
                if (matchCodeFenceEnd(lines[i])) {
                    closed = true;
                    i++;
                    break;
                }

                codeLines.push(lines[i]);
                i++;
            }

            if (!closed) {
                tokens.push(...parseInlineRichText(rawLines.join('\n')));
                continue;
            }

            tokens.push({
                type: 'code-block',
                language: language || 'plain',
                value: codeLines.length > 0 ? `${codeLines.join('\n')}\n` : '',
                markerStart: `\`\`\`${language}\n`,
                markerEnd: '```',
            });
            continue;
        }

        /* ───── HEADING ───── */
        const heading = matchHeading(line);
        if (heading) {
            tokens.push({
                type: 'heading',
                level: heading[1].length,
                children: parseInlineRichText(heading[2]),
            });
            i++;
            continue;
        }

        /* ───── HORIZONTAL RULE ───── */
        if (matchHorizontalRule(line)) {
            tokens.push({ type: 'horizontal-rule' });
            i++;
            continue;
        }

        /* ───── BLOCKQUOTE ───── */
        if (matchBlockquote(line)) {
            const quoteLines: string[] = [];
            const quoteTokens: RichToken[][] = [];

            while (i < lines.length) {
                const match = matchBlockquote(lines[i]);
                if (!match) break;

                quoteLines.push(match[1]);
                quoteTokens.push(parseInlineRichText(match[1]));
                i++;
            }

            tokens.push({
                type: 'blockquote',
                children: parseRichText(quoteLines.join('\n')),
                lines: quoteTokens,
            });

            continue;
        }

        /* ───── LIST ───── */
        const listLine = matchListLine(line);
        if (listLine) {
            const parsedList = parseList(lines, i, listLine.indent, listLine.ordered);
            tokens.push(parsedList.token);
            i = parsedList.nextIndex;
            continue;
        }

        /* ───── NORMAL LINE ───── */
        if (line !== '') {
            tokens.push(...parseInlineRichText(line));
        }

        tokens.push({ type: 'text', value: '\n' });
        i++;
    }

    return tokens;
}

// ─────────────────────────────────────────────────────────────
// Parser inline - processa formatação dentro de uma linha
// Parâmetro skipCodeBlock: quando true, não processa ``` (útil para prompt)
// ─────────────────────────────────────────────────────────────

export function parseInlineRichText(input: string, skipCodeBlock: boolean = false): RichToken[] {
    const tokens: RichToken[] = [];

    let state: ParserState = 'NORMAL';
    let buffer = '';
    let codeLang = '';
    let codeBlockStart = '';

    let i = 0;

    const flushText = () => {
        if (buffer) {
            tokens.push({ type: 'text', value: buffer });
            buffer = '';
        }
    };

    while (i < input.length) {

        /* ───────────── CODE BLOCK (```) ───────────── */
        // Se skipCodeBlock, trata ``` como texto normal (pula os 3 de uma vez)
        if (state === 'NORMAL' && input.startsWith('```', i)) {
            if (skipCodeBlock) {
                buffer += '```';
                i += 3;
                continue;
            }

            // Processa code block normalmente
            flushText();
            codeBlockStart = '```';
            i += 3;

            while (i < input.length && input[i] !== '\n') {
                codeLang += input[i++];
            }
            codeBlockStart += codeLang;
            if (input[i] === '\n') {
                codeBlockStart += '\n';
                i++;
            }

            state = 'CODE_BLOCK';
            buffer = '';
            continue;
        }

        /* ───────────── CODE BLOCK END ───────────── */
        if (state === 'CODE_BLOCK' && input.startsWith('```', i)) {
            tokens.push({
                type: 'code-block',
                language: codeLang.trim() || 'plain',
                value: buffer,
                markerStart: codeBlockStart,
                markerEnd: '```',
            });
            buffer = '';
            codeLang = '';
            codeBlockStart = '';
            state = 'NORMAL';
            i += 3;
            continue;
        }

        /* ───────────── INLINE CODE ───────────── */
        if (state === 'NORMAL' && input[i] === '`') {
            flushText();
            state = 'INLINE_CODE';
            buffer = '';
            i++;
            continue;
        }

        if (state === 'INLINE_CODE' && input[i] === '`') {
            tokens.push({
                type: 'inline-code',
                value: buffer,
                markerStart: '`',
                markerEnd: '`',
            });
            buffer = '';
            state = 'NORMAL';
            i++;
            continue;
        }

        /* ───────────── FORMATTING (NORMAL ONLY) ───────────── */
        if (state === 'NORMAL') {

            // bold **
            if (input.startsWith('**', i) && isBoundary(input[i - 1])) {
                const end = input.indexOf('**', i + 2);
                // Verifica se o fechamento está em uma boundary
                if (end !== -1 && isBoundary(input[end + 2])) {
                    flushText();
                    tokens.push({
                        type: 'bold',
                        value: input.slice(i + 2, end),
                        markerStart: '**',
                        markerEnd: '**',
                    });
                    i = end + 2;
                    continue;
                }
            }

            // strike ~~
            if (input.startsWith('~~', i) && isBoundary(input[i - 1])) {
                const end = input.indexOf('~~', i + 2);
                // Verifica se o fechamento está em uma boundary
                if (end !== -1 && isBoundary(input[end + 2])) {
                    flushText();
                    tokens.push({
                        type: 'strike',
                        value: input.slice(i + 2, end),
                        markerStart: '~~',
                        markerEnd: '~~',
                    });
                    i = end + 2;
                    continue;
                }
            }

            // italic _
            if (input[i] === '_' && isBoundary(input[i - 1])) {
                const end = input.indexOf('_', i + 1);
                // Verifica se o fechamento está em uma boundary (espaço, pontuação ou fim)
                if (end !== -1 && isBoundary(input[end + 1])) {
                    flushText();
                    tokens.push({
                        type: 'italic',
                        value: input.slice(i + 1, end),
                        markerStart: '_',
                        markerEnd: '_',
                    });
                    i = end + 1;
                    continue;
                }
            }

            // agent @@agent
            if (
                input[i] === '@' &&
                input[i + 1] === '@' &&
                isBoundary(input[i - 1])
            ) {
                const match = input.slice(i + 2).match(/^[a-zA-Z0-9_-]+/);
                if (match) {
                    flushText();
                    tokens.push({
                        type: 'agent',
                        value: match[0],
                    });
                    i += match[0].length + 2;
                    continue;
                }
            }

            // mention markdown [@Name](userId)
            if (input[i] === '[' && input[i + 1] === '@') {
                const closeText = input.indexOf(']', i + 2);
                const openParen = input[closeText + 1] === '(' ? closeText + 1 : -1;
                const closeParen = openParen !== -1
                    ? input.indexOf(')', openParen + 1)
                    : -1;

                if (closeText !== -1 && openParen !== -1 && closeParen !== -1) {
                    flushText();

                    const name = input.slice(i + 2, closeText);
                    const userId = input.slice(openParen + 1, closeParen);

                    tokens.push({
                        type: 'mention',
                        value: name,
                        userId,
                    });

                    i = closeParen + 1;
                    continue;
                }
            }

            // channel #
            if (input[i] === '#' && isBoundary(input[i - 1])) {
                const match = input.slice(i + 1).match(/^[a-zA-Z0-9_-]+/);
                if (match) {
                    flushText();
                    tokens.push({
                        type: 'channel',
                        value: match[0],
                    });
                    i += match[0].length + 1;
                    continue;
                }
            }

            // command /
            if (input[i] === '/' && isBoundary(input[i - 1])) {
                const match = input.slice(i + 1).match(/^[a-zA-Z0-9_-]+/);
                if (match) {
                    flushText();
                    tokens.push({
                        type: 'command',
                        value: match[0],
                    });
                    i += match[0].length + 1;
                    continue;
                }
            }

            // help ?
            if (input[i] === '?' && isBoundary(input[i - 1])) {
                const match = input.slice(i + 1).match(/^[a-zA-Z0-9_-]+/);
                if (match) {
                    flushText();
                    tokens.push({ type: 'help', value: match[0] });
                    i += match[0].length + 1;
                    continue;
                }
            }

            // markdown link [text](url)
            if (input[i] === '[') {
                const closeText = input.indexOf(']', i + 1);
                const openParen = closeText !== -1 && input[closeText + 1] === '(' ? closeText + 1 : -1;
                const closeParen = openParen !== -1 ? input.indexOf(')', openParen + 1) : -1;

                if (closeText !== -1 && openParen !== -1 && closeParen !== -1) {
                    flushText();
                    const text = input.slice(i + 1, closeText);
                    const url = input.slice(openParen + 1, closeParen);
                    tokens.push({ type: 'link', text, url });
                    i = closeParen + 1;
                    continue;
                }
            }

            // raw link
            if (isBoundary(input[i - 1])) {
                const match = matchRawLink(input.slice(i));
                if (match) {
                    flushText();
                    const url = match[0];
                    tokens.push({ type: 'raw-link', url });
                    i += url.length;
                    continue;
                }
            }
        }

        /* ───────────── DEFAULT CHAR ───────────── */
        buffer += input[i];
        i++;
    }

    /* ───────────── FLUSH ───────────── */
    if (buffer) {
        if (state === 'INLINE_CODE') {
            // Inline code não fechado - retorna como texto normal incluindo o backtick inicial
            tokens.push({ type: 'text', value: '`' + buffer });
        } else if (state === 'CODE_BLOCK') {
            // Code block não fechado - retorna como texto normal
            tokens.push({ type: 'text', value: codeBlockStart + buffer });
        } else {
            tokens.push({ type: 'text', value: buffer });
        }
    }

    return tokens;
}
