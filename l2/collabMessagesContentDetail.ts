/// <mls fileReference="_102025_/l2/collabMessagesContentDetail.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { environment } from '/_102036_/l2/environmentContract.js';

import '/_102025_/l2/collabMessagesRichPreviewText.js';

@customElement('collab-messages-content-detail-102025')
export class CollabMessagesContentDetail102025 extends StateLitElement {

    // Not `title`: that is the native HTMLElement tooltip and would show over the whole panel.
    @property({ type: String }) heading = '';

    @property({ type: String }) text = '';

    render() {
        return html`
            <div class="content-detail-title">${this.heading}</div>
            <collab-messages-rich-preview-text-102025
                .text=${this.text}
                .collapseCodeBlocks=${false}>
            </collab-messages-rich-preview-text-102025>
        `;
    }
}

export function openContentInDetails(input: { id: string; title: string; text: string }): Promise<boolean> {
    const element = document.createElement('collab-messages-content-detail-102025') as CollabMessagesContentDetail102025;
    element.heading = input.title;
    element.text = input.text;
    return environment.details.openContent({ id: input.id, title: input.title, element });
}
