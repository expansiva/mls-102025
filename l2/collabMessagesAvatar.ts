/// <mls fileReference="_102025_/l2/collabMessagesAvatar.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, unsafeHTML } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { collab_user } from '/_102025_/l2/collabMessagesIcons.js';
import { generateAgentAvatar } from '/_102025_/l2/collabMessagesHelper.js';

@customElement('collab-messages-avatar-102025')
export class CollabMessagesAvatar extends StateLitElement {

    @property() avatar: string = '';
    @property() alt: string = '';

    @property({ type: String }) width = '30px';
    @property({ type: String }) height = '30px';

    updated(changedProperties: Map<string, any>) {
        super.updated(changedProperties);
        if (changedProperties.has('width') || changedProperties.has('height')) {
            this.style.setProperty('--avatar-width', this.width);
            this.style.setProperty('--avatar-height', this.height);
        }
    }

    render() {

        const isSvg = this.avatar.trim().startsWith('<svg');

        const avatar = this.avatar ? this.avatar : generateAgentAvatar(this.alt || '.')

        return html`
        <div class="avatar">
            ${avatar
                ? isSvg ? html`${unsafeHTML(avatar)}` : html`<img src="${avatar}" alt="${this.alt || 'Avatar'}" />`
                : html`<div class="avatar-placeholder">${collab_user}</div>`
            }
        </div>`;
    }
}
