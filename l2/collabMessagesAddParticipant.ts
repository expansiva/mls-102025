/// <mls fileReference="_102025_/l2/collabMessagesAddParticipant.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

import { updateThread, updateUsers } from '/_102025_/l2/collabMessagesIndexedDB.js';
import { notifyThreadChange } from '/_102025_/l2/collabMessagesEvents.js';
import { msgAddParticipantToThread, msgGetThreadUpdates, msgGetUsers } from '/_102025_/l2/shared/api.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';


/// **collab_i18n_start** 
const message_pt = {
    loading: 'Carregando...',
    btnAddParticipant: 'Adicionar participante',
    labelUserId: 'Nome do usuario ou Id',
    labelPermission: 'Autoridade:',
    errorFieldsAddParticipant: 'Preencha todos os campos!',
    successAddParticipant: 'Usuário adicionado com sucesso',
    threadDetails: 'Detalhes da sala'
}

const message_en = {
    loading: 'Loading...',
    btnAddParticipant: 'Add Participant',
    labelUserId: 'User id or name',
    labelPermission: 'Auth:',
    errorFieldsAddParticipant: 'Fill in all fields!',
    successAddParticipant: 'User added sucessfully',
    threadDetails: 'Thread details'
}

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    'en': message_en,
    'pt': message_pt
}
/// **collab_i18n_end**

@customElement('collab-messages-add-participant-102025')
export class CollabMessagesAddParticipant extends StateLitElement {

    private msg: MessageType = messages['en'];

    @property() userId: string | undefined;
    @property() labelOkAddParticipant: string = '';
    @property() labelErrorAddParticipant: string = '';
    @property() userIdOrName = '';
    @property() auth: msg.UserAuth = 'write';
    @property() isAddParticipant: boolean = false;
    @property() actualThread: IThreadActual | undefined;

    @property() highlightedIndex: number = -1;
    @state() suggestions: string[] = [];
    @state() allUsers: string[] = [];
    @state() private users: {
        userId: string;
        name: string;
    }[] = [];

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        await this.loadUsersAvaliables();
    }

    render() {
        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

        return html`
        <div class="add-participant">
            <label style="position: relative;">
                ${this.msg.labelUserId}
                <input 
                    name="add participant"
                    autocomplete="off"
                    type="text"
                    .value=${this.userIdOrName}
                     @input=${this.onInput}
                     @blur=${this.onBlur}
                     @focus=${this.onFocus}
                     @keydown=${this.onKeyDown}
                />
                ${this.suggestions.length > 0
                ? html`
                        <div class="suggestions">
                        ${this.suggestions.map(
                    (item, index) => html`
                            <div
                                class="suggestion ${index === this.highlightedIndex ? 'highlighted' : ''}"
                                @click=${() => this.selectSuggestion(item)}
                            >
                                ${item}
                            </div>
                            `
                )}
                        </div>
                    `
                : null}
            </label>

            

            <label>
                ${this.msg.labelPermission}
                <select
                    .value=${this.auth}
                    @change=${(e: Event) => (this.auth as string) = (e.target as HTMLSelectElement).value}
                >
                    <option value="admin">Admin</option>
                    <option value="moderator">Moderator</option>
                    <option value="none">None</option>
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                </select>
            </label>

            <button
                @click=${this.onSubmitAddParticipant}
                ?disabled=${this.isAddParticipant}
            >
                ${this.isAddParticipant ? html`<span class="loader"></span>` : this.msg.btnAddParticipant}
            </button>
            
            ${this.labelOkAddParticipant ? html`<small class="add-participant-ok">${this.labelOkAddParticipant}<small>` : ''}
            ${this.labelErrorAddParticipant ? html`<small class="add-participant-error">${this.labelErrorAddParticipant}<small>` : ''}
        </div>
    `;
    }

    private onInput(e: Event) {
        const value = (e.target as HTMLInputElement).value;
        this.userIdOrName = value;
        if (!value.trim()) {
            this.suggestions = [];
            return;
        }

        this.suggestions = this.allUsers.filter((name) =>
            name.toLowerCase().includes(value.toLowerCase())
        );
    }

    private onBlur() {
        setTimeout(() => {
            this.suggestions = [];
        }, 200);
    }

    private selectSuggestion(suggestion: string) {
        this.userIdOrName = suggestion;
        this.suggestions = [];
    }

    private onKeyDown(e: KeyboardEvent) {
        if (this.suggestions.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.highlightedIndex = (this.highlightedIndex + 1) % this.suggestions.length;
        }

        if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.highlightedIndex =
                (this.highlightedIndex - 1 + this.suggestions.length) % this.suggestions.length;
        }

        if (e.key === 'Tab' || e.key === 'Enter') {
            if (this.highlightedIndex >= 0 && this.highlightedIndex < this.suggestions.length) {
                e.preventDefault(); // previne foco mudar com Tab
                this.selectSuggestion(this.suggestions[this.highlightedIndex]);
            }
        }
    }



    private onFocus() {
        if (this.userIdOrName) {
            this.suggestions = this.allUsers.filter((name) =>
                name.toLowerCase().includes(this.userIdOrName.toLowerCase())
            );
        }
    }


    private async onSubmitAddParticipant() {
        this.labelErrorAddParticipant = '';
        this.labelOkAddParticipant = '';

        if (!this.actualThread || !this.userId) return;

        if (!this.userIdOrName || !this.auth) {
            this.labelErrorAddParticipant = 'Please fill in all required fields.';
            return;
        }

        this.isAddParticipant = true;

        try {

            debugger;

            const result = await msgAddParticipantToThread({
                auth: this.auth,
                userIdOrName: this.userIdOrName.trim(),
                threadId: this.actualThread.thread.threadId,
                userId: this.userId,
            });

            if (!result.success || !result.response) {
                this.labelErrorAddParticipant =
                    result.error || 'Failed to add participant to the thread.';
                return;
            }

            const thread = result.response.thread;

            // Update local cache
            const updatedThread = await updateThread(thread.threadId, thread);

            // Sync updates
            const threadUpdate = await msgGetThreadUpdates({
                threadId: thread.threadId,
                userId: this.userId,
                lastOrderAt: updatedThread.lastSync || new Date('2000-01-01').toISOString(),
            });

            if (threadUpdate.success && threadUpdate.response?.users) {
                await updateUsers(threadUpdate.response.users);
            }

            if (threadUpdate.success && threadUpdate.response?.thread) {
                notifyThreadChange(threadUpdate.response.thread);
            }

            // Emit event
            this.dispatchEvent(new CustomEvent('add-participant', {
                detail: { thread: updatedThread },
                bubbles: true,
                composed: true
            }));

            // Success feedback
            this.labelOkAddParticipant =
                this.msg.successAddParticipant || 'Participant added successfully.';

            setTimeout(() => {
                this.labelOkAddParticipant = '';
            }, 3000);

            // Reset form
            this.userIdOrName = '';
            this.auth = 'write';

        } catch (error: any) {
            console.error('Error adding participant to thread:', error);
            this.labelErrorAddParticipant =
                error?.message || 'An unexpected error occurred while adding the participant.';
        } finally {
            this.isAddParticipant = false;
        }
    }

    private async loadUsersAvaliables() {
        if (!this.userId) return;

        const result = await msgGetUsers({
            status: "active",
            prefixName: "",
            userId: this.userId
        });

        if (!result.success || !result.response?.users) return;

        this.users = result.response.users;
        this.allUsers = this.users.map((usr) => usr.name);
    }

}

interface IThreadActual {
    thread: msg.ThreadPerformanceCache,
    users: msg.User[]
}
