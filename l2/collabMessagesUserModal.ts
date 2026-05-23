/// <mls fileReference="_102025_/l2/collabMessagesUserModal.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { createThreadDM, getDmThreadByUsers } from '/_102025_/l2/collabMessagesHelper.js';
import { dispatchThreadOpen } from '/_102025_/l2/collabMessagesEvents.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';


/// **collab_i18n_start**
const message_pt = {
    loading: 'Carregando...',
    messageDirect: 'Ir para direct message',
}

const message_en = {
    loading: 'Loading...',
    messageDirect: 'Go to direct message',

}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

@customElement('collab-messages-user-modal-102025')
export class CollabMessagesUserModal extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property({ type: Boolean }) open = true;
    @property() user?: msg.User;
    @property() actualUserId?: string;
    @property({ type: Boolean }) isDirectMessage: boolean = false;

    @state() private isLoading: boolean = false;
    @state() private errorMessage: string = '';

    private close() {
        this.open = false;
    }

    private handleGlobalClick = (e: MouseEvent) => {
        if (!this.contains(e.target as Node)) {
            this.destroy();
        }
    };

    firstUpdated() {
        document.addEventListener('click', this.handleGlobalClick);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener('click', this.handleGlobalClick);
    }

    private destroy() {
        this.remove();
    }

    render() {

        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        if (!this.open) return null;

        return html`
        <div class="collab-messages-user-modal-box"
            @mouseover=${(e: MouseEvent) => e.stopPropagation()}
            @mouseleave=${(e: MouseEvent) => { e.stopPropagation(); this.destroy(); }}
            @click=${(e: Event) => e.stopPropagation()}
        >
            <div class="collab-messages-user-modal-header">
            <img class="collab-messages-user-modal-avatar" src=${this.user?.avatar_url} alt=${this.user?.name} />
                <div>
                    <div class="collab-messages-user-modal-userName">${this.user?.name}<span class="collab-messages-user-modal-userId"> (${this.user?.userId})</span></div>
                    <div class="collab-messages-user-modal-userStatus ${this.user?.status}"> ● ${this.user?.status}</div>
                </div>
            </div>

            ${this.errorMessage ? html`<small class="user-message-error">${this.errorMessage}<small>` : ''}

            ${this.actualUserId !== this.user?.userId && !this.isDirectMessage ?
                html`    
                <div class="collab-messages-user-modal-actions">
                    <a
                        href="#"
                        @click=${this.onClickUserAction} 
                        class="collab-messages-user-modal-message-btn"
                        aria-disabled=${this.isLoading ? 'true' : 'false'}
                    >
                        ${this.isLoading ? html`<span class="loader"></span>` : this.msg.messageDirect}
                    </a>
                </div>`: ''
            }
        
        </div>
    
    `;
    }

    private async onClickUserAction(e: Event) {

        e.preventDefault();
        if (this.isLoading) return;
        if (!this.actualUserId || !this.user) return;
        this.isLoading = true;
        try {
            let thread = await getDmThreadByUsers(this.actualUserId, this.user.userId);
            if (!thread) {
                const threadName = `@${this.user.name}`;
                thread = await createThreadDM(threadName, this.user.userId, 'CONNECT');
            }
            this.destroy();
            if (thread) dispatchThreadOpen(thread?.threadId);

        } catch (err: any) {
            this.errorMessage = err.message;
        } finally {
            this.isLoading = false;
        };


    }

}
