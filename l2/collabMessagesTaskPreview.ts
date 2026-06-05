/// <mls fileReference="_102025_/l2/collabMessagesTaskPreview.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getAllSteps } from '/_102027_/l2/aiAgentHelper.js';
import { CollabLitElement } from '/_102027_/l2/collabLitElement.js';

import '/_102025_/l2/collabMessagesTaskPreviewAgent.js';
import '/_102025_/l2/collabMessagesTaskPreviewClarification.js';
import '/_102025_/l2/collabMessagesTaskPreviewFlexible.js';
import '/_102025_/l2/collabMessagesTaskPreviewTools.js';
import '/_102025_/l2/collabMessagesTaskPreviewResult.js';
import '/_102025_/l2/collabMessagesTaskPreviewRaw.js';

@customElement('collab-messages-task-preview-102025')

export class CollabMessagesTaskPreview extends CollabLitElement {

    @property({ type: Object }) message: mls.msg.Message | null = null;
    @property({ type: Object }) task: mls.msg.TaskData | null = null;
    @property() modeTest: boolean = false;
    @property() father: HTMLElement | undefined;
    @property() initialStep = '';

    @state() private stepMap = new Map<number, any>();
    @state() private navigationStack: number[] = [];
    @state() private currentStepId: number | null = null;
    @state() private allSteps: any[] = [];

    private lastStepId = 0;
    // Steps that are shown inside a sending step's "payload" tab (children of
    // some step's interaction.payload). They are skipped during navigation.
    private payloadStepIds = new Set<number>();

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

        if (this.currentStepId === 0 || !this.currentStepId) {
            return html`
            ${this.renderNavigation( 0)}
            <div class="container">
            ${this.renderStepDetails(undefined)}
            </div>
        `;
        }

        const step = this.stepMap.get(this.currentStepId);
        if (!step) {
            return html`<p>Step not found: ${this.currentStepId}</p>`;
        }
        return html`
            ${this.renderNavigation(step.stepId || 0)}
            <div class="container">
            ${this.renderStepDetails(step)}
            </div>
            ${this.renderBreadcrumb()}
        `;
    }

    renderNavigation(stepId: number) {
        const step = this.stepMap.get(stepId);
        const all = this.allSteps.length.toString().padStart(2, '0');

        let name = `00/${all}`;
        if (step) name = `${stepId.toString().padStart(2, '0')}/${all}`;

        return html`
            <div class="tabAction">
                <button title="início (task)" @click=${() => this.goFirst()}><svg style="width:13px; fill:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M267.5 440.6c9.5 7.9 22.8 9.7 34.1 4.4s18.4-16.6 18.4-29l0-320c0-12.4-7.2-23.7-18.4-29s-24.5-3.6-34.1 4.4l-192 160L64 96c0-17.7-14.3-32-32-32S0 78.3 0 96L0 416c0 17.7 14.3 32 32 32s32-14.3 32-32l0-176.6 192 160z"/></svg></button>
                <button title="anterior" @click=${() => this.goPrev(stepId)}><svg style="width:13px; fill:#fff; transform: rotateY(180deg);" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></button>
                <span>${name}</span>
                <button title="próximo" @click=${() => this.goNext(stepId)}><svg style="width:13px; fill:#fff" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-160-160c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L338.8 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l306.7 0L233.4 393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l160-160z"/></svg></button>
                <button title="em progresso" @click=${() => this.goLast()}><svg style="width:13px; fill:#fff;" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512"><path d="M52.5 440.6c-9.5 7.9-22.8 9.7-34.1 4.4S0 428.4 0 416L0 96C0 83.6 7.2 72.3 18.4 67s24.5-3.6 34.1 4.4l192 160L256 96c0-17.7 14.3-32 32-32s32 14.3 32 32l0 320c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-176.6-192 160z"/></svg></button>
            </div>
        `;
    }

    // Step ids that the arrows can land on: real steps (>0) excluding payload
    // children (those are shown in the sending step's payload tab).
    private navigableStepIds(): number[] {
        return this.allSteps
            .map((s) => s.stepId as number)
            .filter((id) => id > 0 && !this.payloadStepIds.has(id))
            .sort((a, b) => a - b);
    }

    private setCurrentStep(stepId: number) {
        this.currentStepId = stepId;
        if (this.father) (this.father as any).currentStepId = stepId;
        this.navigationStack = stepId === 0 ? [0] : [0, stepId];
    }

    // '<<' — jump to the special step 0 (whole task / raw view).
    private goFirst() {
        this.setCurrentStep(0);
    }

    // '<' — previous navigable step, or step 0 if already at the first.
    private goPrev(current: number) {
        const ids = this.navigableStepIds().filter((id) => id < current);
        this.setCurrentStep(ids.length ? ids[ids.length - 1] : 0);
    }

    // '>' — next navigable step (skips payload steps).
    private goNext(current: number) {
        const ids = this.navigableStepIds().filter((id) => id > current);
        if (ids.length) this.setCurrentStep(ids[0]);
    }

    // '>>' — jump to the in-progress step; if none, the last navigable step.
    private goLast() {
        const ids = this.navigableStepIds();
        const navSet = new Set(ids);
        const inProgress = this.allSteps.find(
            (s) => s.status === 'in_progress' && navSet.has(s.stepId)
        );
        if (inProgress) {
            this.setCurrentStep(inProgress.stepId);
            return;
        }
        if (ids.length) this.setCurrentStep(ids[ids.length - 1]);
    }

    renderStepDetails(step: any | undefined) {
        if (!step && this.currentStepId === 0) {
            return this.renderRaw();
        }

        if (!step) {
            return "Not found step";
        }

        switch (step.type) {
            case 'agent': return this.renderAgent(step);
            case 'clarification': return this.renderClarification(step);
            case 'flexible': return this.renderFlexible(step);
            case 'tool': return this.renderTools(step);
            case 'result': return this.renderResult(step);
            case 'dynamicWorkflow':
            case 'staticWorkflow': return this.renderWorkflow(step);
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
                    return;
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

    renderRaw() {
        return html` <collab-messages-task-preview-raw-102025  .message=${this.message} .task=${this.task}></collab-messages-task-preview-raw-102025> `;
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

    renderWorkflow(step: { stepId: number, type: string, workflowName?: string, status?: string, nextSteps?: any[] }) {
        return html`
            <div class="workflow-step">
                <div class="workflow-step-title">${step.workflowName || this.task?.title || 'Workflow'}</div>
                <div class="workflow-step-meta">
                    <span>Step ${step.stepId}</span>
                    <span>${step.type}</span>
                    <span>${step.status || 'pending'}</span>
                </div>
                <p>Messages and updates for this workflow are handled in the Chat tab.</p>
                ${step.nextSteps?.length
                    ? html`<button @click=${() => this.navigateToStep(step.nextSteps?.[0]?.stepId)}>Open next step</button>`
                    : html``}
            </div>
        `;
    }

    //------IMPLEMENTATION--------

    private init() {
        if (!this.task || !this.task.iaCompressed) return;
        this.stepMap.clear();
        this.payloadStepIds.clear();
        this.buildStepMap(this.task.iaCompressed.nextSteps);
        //this.currentStepId = 0;
        this.navigationStack = [0];
        if (this.currentStepId && this.currentStepId > 0) {
            this.navigationStack = [];
            for (let i = 0; i <= this.currentStepId; i++){
                this.navigationStack.push(i);
            }
        }
        this.allSteps = getAllSteps(this.task.iaCompressed.nextSteps as any);
        this.lastStepId = this.allSteps[this.allSteps.length - 1]?.stepId || 0;
    }

    private onTaskChange(e: Event) {
        if (!this.task) return;
        const customEvent = e as CustomEvent;
        const task: mls.msg.TaskData = customEvent.detail.context.task;
        if (task.PK !== this.task.PK) return;
        this.task = task;
        if (!this.task || !this.task.iaCompressed) return;
        this.stepMap.clear();
        this.payloadStepIds.clear();
        this.buildStepMap(this.task.iaCompressed.nextSteps);
        this.allSteps = getAllSteps(this.task.iaCompressed.nextSteps as any);
    }

    private buildStepMap(steps: any[]) {
        for (const step of steps) {
            this.stepMap.set(step.stepId, step);
            if (step.interaction?.payload) {
                // payload children are shown in the parent step's "payload" tab,
                // so they should be skipped by the navigation arrows.
                for (const child of step.interaction.payload) {
                    if (child && typeof child.stepId === 'number') this.payloadStepIds.add(child.stepId);
                }
                this.buildStepMap(step.interaction.payload);
            }
            if (step.nextSteps) {
                this.buildStepMap(step.nextSteps);
            }
        }
    }

    private tryNext = 0;
    private navigateToStep(stepId: number) {
        if (!this.stepMap.has(stepId)) {
            if (this.tryNext < 200) {
                this.tryNext++;
                this.navigateToStep(stepId + 1);
            }
            return;
        }

        this.tryNext = 0;
        this.currentStepId = stepId;
        if(this.father) (this.father as any).currentStepId = this.currentStepId;
        this.navigationStack = [...this.navigationStack, stepId];
    }

    private goBack() {
        if (this.navigationStack.length > 1) {
            this.navigationStack.pop();
            this.currentStepId = this.navigationStack[this.navigationStack.length - 1];

            if (!this.stepMap.has(this.currentStepId)) {
                this.goBack();
            }
    
        } else { this.currentStepId = 0; }
    }

}
