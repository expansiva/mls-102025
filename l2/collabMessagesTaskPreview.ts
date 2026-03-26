/// <mls fileReference="_102025_/l2/collabMessagesTaskPreview.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getAllSteps } from '/_102029_/l2/aiAgentHelper.js';
import { CollabLitElement } from '/_102029_/l2/collabLitElement.js';

import '/_102025_/l2/collabMessagesTaskPreviewAgent.js';
import '/_102025_/l2/collabMessagesTaskPreviewClarification.js';
import '/_102025_/l2/collabMessagesTaskPreviewFlexible.js';
import '/_102025_/l2/collabMessagesTaskPreviewTools.js';
import '/_102025_/l2/collabMessagesTaskPreviewResult.js';

@customElement('collab-messages-task-preview-102025')
export class CollabMessageTaskPreview extends CollabLitElement {

    @property({ type: Object }) message: mls.msg.Message | null = null;
    @property({ type: Object }) task: mls.msg.TaskData | null = null;
    @property() modeTest: boolean = false;

    @state() private stepMap = new Map<number, any>();
    @state() private navigationStack: number[] = [];
    @state() private currentStepId: number | null = null;
    @state() private allSteps: mls.msg.AIPayload[] = [];

    disconnectedCallback() {
        window.removeEventListener('task-change', this.onTaskChange.bind(this));
    }

    firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        if (this.modeTest) return;
        this.init();
        window.addEventListener('task-change', this.onTaskChange.bind(this));
    }

    render() {
        if (!this.task) {
            return html`<p>Task not provided.</p>`;
        }
        return html`${this.renderStep()}`;
    }

    renderStep() {
        if (!this.task) {
            return html`<p>Task not provided.</p>`;
        }
        if (!this.currentStepId) {
            return html`<p>No steps selected.</p>`;
        }
        const step = this.stepMap.get(this.currentStepId);
        if (!step) {
            return html`<p>Step not found: ${this.currentStepId}</p>`;
        }
        return html`
            ${this.renderNavigation(step.stepId)}
            <div class="container">
            ${this.renderStepDetails(step)}
            </div>
            ${this.renderBreadcrumb()}
        `;
    }

    renderNavigation(stepId: number) {
        const goToPrevious = () => {
            this.goBack()
        };
        const goToNext = () => {
            this.navigateToStep(stepId + 1)
        };
        const step = this.stepMap.get(stepId);
        const all = this.allSteps.length.toString().padStart(2, '0');
        let name = `00/${all}`;
        if (step) name = `${stepId.toString().padStart(2, '0')}/${all}`;
        return html`
            <div class="tabAction">
                <button @click=${goToPrevious} ><svg style="width:13px; fill:#fff; transform: rotateY(180deg);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></button>
                <span>${name}</span>
                <button @click=${goToNext} ><svg style="width:13px; fill:#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></button>
            </div>
        `;
    }

    renderStepDetails(step: mls.msg.AIPayload) {
        switch (step.type) {
            case 'agent': return this.renderAgent(step);
            case 'clarification': return this.renderClarification(step);
            case 'flexible': return this.renderFlexible(step);
            case 'tool': return this.renderTools(step);
            case 'result': return this.renderResult(step);
            default: return html`Not found type: renderStepDetails`;
        }
    }

    renderBreadcrumb() {
        return html`
            <nav class="breadcrumb">
                ${this.navigationStack.map(
            (stepId, idx) => {
                const step = this.stepMap.get(stepId);
                if (!step) {
                    return html`<p>Step not found: ${this.currentStepId}</p>`;
                }
                return html` <span
                            @click=${() => {
                        this.navigationStack = this.navigationStack.slice(0, idx + 1);
                        this.currentStepId = stepId;
                    }} >${step.agentName ? step.agentName : step.type}</span>
                            `
            })}
            </nav>
        `;
    }

    renderAgent(step: mls.msg.AIAgentStep) {
        return html` <collab-messages-task-preview-agent-102025 .step=${step} .message=${this.message} .task=${this.task} key="${step.stepId}"></collab-messages-task-preview-agent-102025> `;
    }

    renderClarification(step: mls.msg.AIClarificationStep) {
        return html` <collab-messages-task-preview-clarification-102025 .step=${step} .message=${this.message}  .task=${this.task} key="${step.stepId}"></collab-messages-task-preview-clarification-102025> `;
    }

    renderFlexible(step: mls.msg.AIFlexibleResultStep) {
        return html` <collab-messages-task-preview-flexible-102025 .step=${step} .message=${this.message}  .task=${this.task} key="${step.stepId}"></collab-messages-task-preview-flexible-102025> `;
    }

    renderTools(step: mls.msg.AIToolStep) {
        return html` <collab-messages-task-preview-tools-102025 .step=${step} .message=${this.message}  .task=${this.task} key="${step.stepId}"></collab-messages-task-preview-tools-102025> `;
    }

    renderResult(step: mls.msg.AIResultStep) {
        return html` <collab-messages-task-preview-result-102025 .step=${step} .message=${this.message}  .task=${this.task} key="${step.stepId}"></collab-messages-task-preview-result-102025> `;
    }

    //------IMPLEMENTATION--------

    private init() {
        if (!this.task || !this.task.iaCompressed) return;
        this.stepMap.clear();
        this.buildStepMap(this.task.iaCompressed.nextSteps);
        this.currentStepId = 1;
        this.navigationStack = [1];
        this.allSteps = getAllSteps(this.task.iaCompressed.nextSteps);
    }

    private onTaskChange(e: Event) {
        if (!this.task) return;
        const customEvent = e as CustomEvent;
        const task: mls.msg.TaskData = customEvent.detail.context.task;
        if (task.PK !== this.task.PK) return;
        this.task = task;
        if (!this.task || !this.task.iaCompressed) return;
        this.stepMap.clear();
        this.buildStepMap(this.task.iaCompressed.nextSteps);
        this.allSteps = getAllSteps(this.task.iaCompressed.nextSteps);
    }

    private buildStepMap(steps: mls.msg.AIPayload[]) {
        for (const step of steps) {
            this.stepMap.set(step.stepId, step);
            if (step.interaction?.payload) {
                this.buildStepMap(step.interaction.payload);
            }
            if (step.nextSteps) {
                this.buildStepMap(step.nextSteps);
            }
        }
    }

    private navigateToStep(stepId: number) {
        if (!this.stepMap.has(stepId)) {
            return;
        }
        this.currentStepId = stepId;
        this.navigationStack = [...this.navigationStack, stepId];
    }

    private goBack() {
        if (this.navigationStack.length > 1) {
            this.navigationStack.pop();
            this.currentStepId = this.navigationStack[this.navigationStack.length - 1];
        }
    }

}

