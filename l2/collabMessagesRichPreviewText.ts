/// <mls fileReference="_102025_/l2/collabMessagesRichPreviewText.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { parseRichText } from '/_102025_/l2/collabMessagesRichTextParser.js';
import type { RichListItem, RichToken } from '/_102025_/l2/collabMessagesRichTextParser.js';

import '/_102025_/l2/collabMessagesTextCode.js';

/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    copy: 'Copiar',
    copied: 'Copiado',
}

const message_en = {
    loading: 'Loading...',
    copy: 'Copy',
    copied: 'Copied',
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**


@customElement('collab-messages-rich-preview-text-102025')
export class CollabMessagesRichPreviewText102025 extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property() allHelpers: string[] = ['?help'];

    @property() allCommands: string[] = ['/command1'];

    @property() allThreads: msg.Thread[] = [];

    @property() allUsers: msg.User[] = [];

    @property({ type: String }) text = ``;

    @property({ type: Boolean }) showMarkers: boolean = false;

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];
        const tokens = parseRichText(this.text);
        return this.renderTokens(tokens);
    }

    private renderTokens(tokens: RichToken[]): any {
        return html`${tokens.map(token => this.renderToken(token))}`;
    }

    private renderMarker(marker?: string) {
        if (!this.showMarkers || !marker) return html``;
        return html`<span class="marker">${marker}</span>`;
    }

    private renderToken(token: RichToken) {
        switch (token.type) {
            case 'text': return this.renderText(token);
            case 'bold': return this.renderBold(token);
            case 'italic': return this.renderItalic(token);
            case 'strike': return this.renderStrike(token);
            case 'inline-code': return this.renderInlineCode(token);
            case 'code-block': return this.renderCodeBlock(token);
            case 'mention': return this.renderMention(token);
            case 'agent': return this.renderAgent(token);
            case 'channel': return this.renderChannel(token);
            case 'command': return this.renderCommand(token);
            case 'help': return this.renderHelp(token);
            case 'link': return this.renderLink(token);
            case 'raw-link': return this.renderRawLink(token);
            case 'blockquote': return this.renderBlockquote(token);
            case 'list': return this.renderList(token);
            default:
                console.warn('Token não reconhecido:', token);
                return html``;

        }
    }

    private renderText(token: { value: string }) {
        const parts = token.value.split('\n');
        return html`
            ${parts.map((part, index) =>
            index === 0
                ? html`${part}`
                : html`<br />${part}`
        )}
        `;
    }

    private renderBold(token: { value: string; markerStart: string; markerEnd: string }) {
        return html`${this.renderMarker(token.markerStart)}<strong>${token.value}</strong>${this.renderMarker(token.markerEnd)}`;
    }

    private renderItalic(token: { value: string; markerStart: string; markerEnd: string }) {
        return html`${this.renderMarker(token.markerStart)}<em>${token.value}</em>${this.renderMarker(token.markerEnd)}`;
    }

    private renderStrike(token: { value: string; markerStart: string; markerEnd: string }) {
        return html`${this.renderMarker(token.markerStart)}<del>${token.value}</del>${this.renderMarker(token.markerEnd)}`;
    }

    private renderInlineCode(token: { value: string; markerStart: string; markerEnd: string }) {
        return html`${this.renderMarker(token.markerStart)}<code class="inline-code">${token.value}</code>${this.renderMarker(token.markerEnd)}`;
    }

    private renderCodeBlock(token: { language: string; value: string; markerStart: string; markerEnd: string }) {
        if (this.showMarkers) {
            return html`
                ${this.renderMarker(token.markerStart)}
                <code class="inline-code">${token.value}</code>
                ${this.renderMarker(token.markerEnd)}
            `;
        }

        return html`
            <div class="collab-md-codeblock-card">
            <div class="collab-md-codeblock-header">
                <span class="collab-md-codeblock-lang">${token.language}</span>
                <button
                class="collab-md-codeblock-copy"
                title="Copiar código"
                @click=${(e: MouseEvent) => this.copyToClipboard(e, token.value)}
                >
                ${this.msg.copy}
                </button>
            </div>

            <collab-messages-text-code-102025
                language="${token.language}"
                .text="${token.value}">
            </collab-messages-text-code-102025>
            </div>
        `;
    }

    private renderAgent(token: { value: string }) {
        return html`
            <span
            class="mention-agent"
            data-agent="${token.value}"
            >
            @@${token.value}
            </span>
        `;
    }

    private renderMention(token: { value: string; userId: string }) {
        const user = this.allUsers?.find(
            u => u.name.toLowerCase() === token.value.toLowerCase()
        );

        const isValid = Boolean(user);

        return html`
            <span
            class="mention ${isValid ? 'mention--valid' : 'mention--invalid'}"
            data-user-id="${user?.userId ?? ''}"
            data-username="${token.value}"

            @click=${(e: MouseEvent) => {
                if (!isValid) return;
                this.dispatchEvent(new CustomEvent('mention-click', {
                    detail: { userId: user!.userId, element: e.target },
                    bubbles: true,
                    composed: true,
                }));
            }}

            @mouseenter=${(e: MouseEvent) => {
                if (!isValid) return;
                this.dispatchEvent(new CustomEvent('mention-hover', {
                    detail: { userId: user!.userId, element: e.target },
                    bubbles: true,
                    composed: true,
                }));
            }}

            @mouseleave=${(e: MouseEvent) => {
                if (!isValid) return;
                this.dispatchEvent(new CustomEvent('mention-leave', {
                    detail: { userId: user!.userId, element: e.target },
                    bubbles: true,
                    composed: true,
                }));
            }}
            >
            @${token.value}
            </span>
        `;
    }

    private renderChannel(token: { value: string }) {
        const channelName = `#${token.value}`;

        const thread = this.allThreads?.find(
            t => t.name === channelName
        );

        const isValid = Boolean(thread);

        return html`
            <span
            class="channel ${isValid ? 'channel--valid' : 'channel--invalid'}"
            data-channel="${token.value}"
            data-thread-id="${thread?.threadId ?? ''}"

            @click=${(ev: MouseEvent) => {
                if (!isValid) return;

                this.dispatchEvent(
                    new CustomEvent('channel-click', {
                        detail: { threadId: thread!.threadId, element: ev.target },
                        bubbles: true,
                        composed: true,
                    })
                );
            }}

            @mouseenter=${(ev: MouseEvent) => {
                if (!isValid) return;

                this.dispatchEvent(
                    new CustomEvent('channel-hover', {
                        detail: { threadId: thread!.threadId, element: ev.target },
                        bubbles: true,
                        composed: true,
                    })
                );
            }}

            @mouseleave=${(ev: MouseEvent) => {
                if (!isValid) return;

                this.dispatchEvent(
                    new CustomEvent('channel-leave', {
                        detail: { threadId: thread!.threadId, element: ev.target },
                        bubbles: true,
                        composed: true,
                    })
                );
            }}
            >
            #${token.value}
            </span>
        `;
    }

    private renderCommand(token: { value: string }) {
        const fullCommand = `/${token.value}`;
        const isValid = this.allCommands?.includes(fullCommand);

        return html`
            <span
            class="command ${isValid ? 'command--valid' : 'command--invalid'}"
            data-command="${token.value}"
            @click=${() => {
                if (!isValid) return;
                this.dispatchEvent(new CustomEvent('command-click', {
                    detail: { command: token.value },
                    bubbles: true,
                    composed: true,
                }));
            }}
            >
            ${fullCommand}
            </span>
        `;
    }

    private renderHelp(token: { value: string }) {
        const full = `?${token.value}`;
        const isValid = this.allHelpers?.includes(full);

        return html`
            <span
            class="help ${isValid ? 'help--valid' : 'help--invalid'}"
            data-help="${token.value}"
            >
            ${full}
            </span>
        `;
    }

    private renderLink(token: { text: string; url: string }) {
        const href = this.normalizeLinkHref(token.url);
        if (!href) return html`[${token.text}](${token.url})`;

        return html`
            <a href="${href}" target="_blank" rel="noopener noreferrer">
            ${token.text}
            </a>
        `;
    }

    private renderRawLink(token: { url: string }) {
        const href = this.normalizeLinkHref(token.url);
        if (!href) return html`${token.url}`;

        return html`
            <a href="${href}" target="_blank" rel="noopener noreferrer">
            ${token.url}
            </a>
        `;
    }

    private renderBlockquote(token: { children: RichToken[] }) {
        return html`
            <blockquote>
            ${this.renderTokens(token.children)}
            </blockquote>
        `;
    }

    private renderList(token: { ordered: boolean; items: RichListItem[] }) {
        return token.ordered
            ? html`
                <ol>
                ${token.items.map(
                item => html`<li>${this.renderTokens(item.children)}</li>`
            )}
                </ol>
            `
            : html`
                <ul>
                ${token.items.map(
                item => html`<li>${this.renderTokens(item.children)}</li>`
            )}
                </ul>
            `;
    }

    private normalizeLinkHref(url: string): string | undefined {
        const trimmed = url.trim();
        if (!trimmed || /[\s\u0000-\u001F]/.test(trimmed)) return undefined;

        const href = trimmed.startsWith('www.') ? `https://${trimmed}` : trimmed;
        if (!/^(https?:\/\/|mailto:)/i.test(href)) return undefined;

        try {
            const parsed = new URL(href);
            return parsed.href;
        } catch (_err) {
            return undefined;
        }
    }

    private copyToClipboard(e: MouseEvent, code: string) {
        if (navigator && navigator.clipboard) {
            navigator.clipboard.writeText(code);
        } else {
            const t = document.createElement('textarea');
            t.value = code; document.body.appendChild(t);
            t.select();
            document.execCommand('copy');
            document.body.removeChild(t);
        }

        if (e.target) (e.target as HTMLElement).innerText = `${this.msg.copied}!`; setTimeout(() => { (e.target as HTMLElement).innerText = `${this.msg.copy}`; }, 1200);
    }
}
