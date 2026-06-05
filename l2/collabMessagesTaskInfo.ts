/// <mls fileReference="_102025_/l2/collabMessagesTaskInfo.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js'; 
import { StateLitElement } from '/_102027_/l2/stateLitElement.js';
import { getClarificationElement, continuePoolingTask } from '/_102027_/l2/aiAgentOrchestration.js';
import { getNextPendentStep, getNextClarificationStep, getInteractionStepId, getStepById } from '/_102027_/l2/aiAgentHelper.js';

import '/_102025_/l2/collabMessagesTaskDetails.js';
import '/_102025_/l2/collabMessagesTaskPreview.js';
import '/_102025_/l2/collabMessagesTaskLogPreview.js';
import '/_102025_/l2/collabMessagesTaskRoom.js';

@customElement('collab-messages-task-info-102025')
export class CollabMessagesTaskInfo extends StateLitElement {

    private elParent: HTMLElement | undefined;
    private contentPluginStyle: {
        element: HTMLElement;
        overflow: string;
        height: string;
        padding: string;
    } | undefined;
    private forceViewRaw = false;
    private hasTodo = true;
    private currentStepId = 0;

    @property() task: mls.msg.TaskData | undefined = undefined;
    @property() message: mls.msg.Message | undefined = undefined;
    @property() restartPooling: boolean = false;
    @property() isTest: boolean = false;

    @property() stepid: string = '';
    @property({ attribute: false }) seen = new Set<string>();

    @property() interactionClarification: mls.msg.AIAgentStep | undefined;
    @query('.direct-clarification') directClarification: HTMLElement | undefined;
    @query('.direct-clarification .content') directClarificationContent: HTMLElement | undefined;

    @state() private activeTab: 'workflow' | 'step' | 'raw' | 'todo' | 'chat' = 'todo';
    @state() isClarificationPending = false;

    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.elParent) this.elParent.style.width = '';
        this.restoreServiceDetailContainer();
        window.removeEventListener('task-change', this.onTaskChange.bind(this));

    }

    async updated(changedProperties: Map<PropertyKey, unknown>) {
        if ((changedProperties.has('task') || changedProperties.has('message')) && this.hasPendingClarification() && !this.forceViewRaw) {
            this.setClarification();
        }
    }

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        this.normalizeServiceDetailContainer();
        window.addEventListener('task-change', this.onTaskChange.bind(this));
        if (this.interactionClarification) {
            this.setClarification();
        }
        if (this.restartPooling && this.message && this.task) {
            const context: mls.msg.ExecutionContext = {
                task: this.task,
                message: this.message,
                isTest: this.isTest || false
            }
            continuePoolingTask(context);
        }
    }

    render() {

        if (!this.task) return html`No task.`;

        const isClarificationPending = this.hasPendingClarification();

        if (isClarificationPending && !this.forceViewRaw) return this.renderDirectClarification();

        return this.renderTab(isClarificationPending);
    }

    renderTab(isClarificationPending: boolean = this.hasPendingClarification()) {

        let aux: any = '';
        const hasTaskRoom = this.canUseTaskRoom();
        const activeTab = hasTaskRoom || this.activeTab !== 'chat' ? this.activeTab : 'todo';

        if (this.hasTodo) {
            aux = html`
            <div class="tab ${activeTab === 'todo' ? 'active' : ''}" @click=${() => this.setTab('todo')} >Todo</div>`;
        }
        return html`
            ${isClarificationPending ? html`<button class="viewraw" @click=${() => this.clickForceViewRaw(false)}>Clarification</button>` : ''}
            <div class="tab-shell">
                <div class="tabs">
                    ${aux}
                    <div
                        class="tab ${activeTab === 'step' ? 'active' : ''}"
                        @click=${() => this.setTab('step')}
                    >Steps</div>
                    ${hasTaskRoom ? html`
                        <div
                            class="tab ${activeTab === 'chat' ? 'active' : ''}"
                            @click=${() => this.setTab('chat')}
                        >Chat</div>
                    ` : ''}
                    <div
                        style="display:none"
                        class="tab ${activeTab === 'raw' ? 'active' : ''}"
                        @click=${() => this.setTab('raw')}
                    >Raw</div>
                    <div
                        style="display:none"
                        class="tab ${activeTab === 'workflow' ? 'active' : ''}"
                        @click=${() => this.setTab('workflow')}
                    >Workflow</div>

                </div>
                <div class="content ${activeTab}">
                    ${this.renderTabContent(activeTab)}
                </div>
            </div>
        `;


    }

    renderTabContent(activeTab: 'workflow' | 'step' | 'raw' | 'todo' | 'chat') {
        switch (activeTab) {
            case 'workflow': return html`workflow`;
            case 'step': return this.renderStep();
            case 'chat': return this.renderChat();
            case 'raw': return this.renderRaw();
            case 'todo': return this.renderTodo();
            default: return html`workflow`;
        }
    }

    renderRaw() {
        return html`<collab-messages-task-details-102025 .task=${this.task} .message=${this.message} taskId=${this.task?.PK}></collab-messages-task-details-102025>`
    }

    renderStep() {
        return html`<collab-messages-task-preview-102025 .message=${this.message} .task=${this.task} .father="${this}" .currentStepId=${this.currentStepId}></collab-messages-task-preview-102025>` 
    }

    renderTodo() {
        return html`<collab-messages-task-log-preview-102025 .message=${this.message} .task=${this.task} .father="${this}"></collab-messages-task-log-preview-102025>`
    }

    renderChat() {
        return html`<collab-messages-task-room-102025 .message=${this.message} .task=${this.task}></collab-messages-task-room-102025>`;
    }

    renderDirectClarification() {

        if (!this.task) throw new Error('Invalid task');
        const payload = getNextClarificationStep(this.task);
        if (!payload) return html``;
        return html`
        <button class="viewraw" @click=${() => this.clickForceViewRaw(true)}>View raw</button>
        <div class="direct-clarification">${this.renderClarification(payload)}
        </div>`
    }

    private hasPendingClarification(): boolean {
        if (!this.task) return false;
        const nextStepPending = getNextPendentStep(this.task);
        return nextStepPending?.type === 'clarification';
    }

    renderClarification(payload: mls.msg.AIClarificationStep) {

        if (!this.task) return html`Invalid task`;
        const parentInteraction = getInteractionStepId(this.task, payload.stepId);
        if (!parentInteraction) return html`No found parentInteraction ${payload.stepId} on task: ${this.task.PK} `;
        const interaction = getStepById(this.task, parentInteraction) as mls.msg.AIAgentStep;
        this.interactionClarification = interaction;
        if (!interaction) return html`Invalid interaction id:${parentInteraction} on task: ${this.task.PK} `
        if (!interaction.agentName) return html`Invalid agent name for step id:${interaction.stepId} on task: ${this.task.PK} `
        return html`<div class="content"> Processing...</div>`

    }

    //---------IMPLEMENTATION -----------

    private clickForceViewRaw(force: boolean) {
        this.forceViewRaw = force;
        this.requestUpdate();
        if (!force) setTimeout(() => this.setClarification(), 300);
    }

    private async setClarification(): Promise<void> {
        if (!this.directClarificationContent || !this.task || !this.message) return;
        let clarification: HTMLElement | null = null;

        try {
            clarification = await getClarificationElement({ message: this.message, task: this.task, isTest: false });
        } catch (error) {
            if ((mls as any).isTraceAgent) console.error('[collabMessagesTaskInfo](setClarification)', error);
            return;
        }

        if (!clarification) return;
        this.directClarificationContent.innerHTML = '';
        this.directClarificationContent.appendChild(clarification);
        this.executeHTMLClarificationScript();
    }

    private executeHTMLClarificationScript() {
        this.directClarification?.querySelectorAll('script').forEach(oldScript => {

            const newScript = document.createElement('script');
            newScript.type = oldScript.type || 'text/javascript';
            if (!newScript.type) {
                newScript.type = 'text/javascript';
            }

            if (oldScript.hasAttribute('type') && oldScript.getAttribute('type') === 'module') {
                newScript.type = 'module';
            }

            if (oldScript.src) {
                newScript.src = oldScript.src;
            } else {
                newScript.textContent = oldScript.textContent;
            }
            oldScript.replaceWith(newScript);
        });
    }


    private setTab(tab: 'workflow' | 'step' | 'raw' | 'todo' | 'chat') {
        if (tab === 'chat' && !this.canUseTaskRoom()) return;
        this.activeTab = tab;
    }

    private canUseTaskRoom() {
        if (!this.task) return false;
        if (this.task.taskRoom?.threadId || this.task.taskRoom?.workflowType) return true;
        const firstStep = this.task.iaCompressed?.nextSteps?.[0] as { type?: string } | undefined;
        return firstStep?.type === 'staticWorkflow' || firstStep?.type === 'dynamicWorkflow';
    }

    private onTaskChange(e: Event) {
        if (!this.task) return;
        const customEvent = e as CustomEvent;
        const task: mls.msg.TaskData = customEvent.detail.context.task;
        if (task.PK !== this.task.PK) return;
        this.task = task;
    }

    private normalizeServiceDetailContainer() {
        const serviceDetail = this.closest('service-detail-100554');
        const contentPlugin = this.closest('#contentPlugin') as HTMLElement | null;
        if (!serviceDetail || !contentPlugin || this.contentPluginStyle) return;

        this.contentPluginStyle = {
            element: contentPlugin,
            overflow: contentPlugin.style.overflow,
            height: contentPlugin.style.height,
            padding: contentPlugin.style.padding,
        };

        contentPlugin.style.overflow = 'hidden';
        contentPlugin.style.height = '100%';
        contentPlugin.style.padding = '0';

        const wrapper = this.parentElement as HTMLElement | null;
        if (wrapper) {
            wrapper.style.height = '100%';
            wrapper.style.minHeight = '0';
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
        }
    }

    private restoreServiceDetailContainer() {
        if (!this.contentPluginStyle) return;
        const { element, overflow, height, padding } = this.contentPluginStyle;
        element.style.overflow = overflow;
        element.style.height = height;
        element.style.padding = padding;
        this.contentPluginStyle = undefined;
    }

}
