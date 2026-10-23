/// <mls fileReference="_102025_/l2/collabMessagesModuleStepper.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getUser } from '/_102025_/l2/collabMessagesIndexedDB.js';

/// **collab_i18n_start**
const message_en = {
    completed: 'Completed',
    inProgress: 'Current',
    pending: 'Upcoming',
    actor: 'Actor',
    passes: 'passes',
    noStages: 'No process stages.',
};

const message_pt = {
    completed: 'Concluída',
    inProgress: 'Atual',
    pending: 'Futura',
    actor: 'Ator',
    passes: 'passagens',
    noStages: 'Sem etapas do processo.',
};

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = { en: message_en, pt: message_pt };
/// **collab_i18n_end**

type ModuleStage = mls.msg.AIModuleStep;

@customElement('collab-messages-module-stepper-102025')
export class CollabMessagesModuleStepper extends StateLitElement {

    @property({ attribute: false }) task: mls.msg.TaskData | undefined = undefined;

    @state() private vertical = false;
    @state() private actorNames: { [userId: string]: string } = {};

    private msg: MessageType = messages.en;
    private resizeObserver: ResizeObserver | undefined;
    private actorLoads = new Set<string>();

    connectedCallback() {
        super.connectedCallback();
        this.resizeObserver = new ResizeObserver((entries) => {
            const width = entries[0]?.contentRect.width ?? this.clientWidth;
            const next = width < 480;
            if (next !== this.vertical) this.vertical = next;
        });
        this.resizeObserver.observe(this);
    }

    disconnectedCallback() {
        this.resizeObserver?.disconnect();
        super.disconnectedCallback();
    }

    render() {
        this.msg = messages[this.getMessageKey(messages)];
        const stages = this.getStages();
        if (stages.length === 0) {
            return html`<div class="stepper-empty">${this.msg.noStages}</div>`;
        }
        return html`
            <ol class="stepper ${this.vertical ? 'vertical' : 'horizontal'}" role="list">
                ${stages.map((stage, index) => this.renderStage(stage, index, stages.length))}
            </ol>
        `;
    }

    private getStages(): ModuleStage[] {
        const root = this.task?.iaCompressed?.nextSteps?.[0];
        if (!root || root.type !== 'module') return [];
        const children = (root.nextSteps ?? []) as mls.msg.AIPayload[];
        return children.filter((step): step is ModuleStage => step.type === 'module');
    }

    private renderStage(stage: ModuleStage, index: number, total: number): TemplateResult<1> {
        const title = stage.stepTitle || stage.module.key;
        const status = stage.status === 'completed' || stage.status === 'in_progress' ? stage.status : 'pending';
        const passes = stage.module.passes > 1
            ? html`<span class="passes" title="${this.msg.passes}">×${stage.module.passes}</span>`
            : html``;
        const actorName = status === 'in_progress' ? this.actorName(stage.module.actorNow) : '';
        const actor = actorName
            ? html`<span class="actor">${this.msg.actor}: ${actorName}</span>`
            : html``;
        const mark = status === 'completed' ? '✓' : String(index + 1);
        const statusLabel = status === 'completed'
            ? this.msg.completed
            : status === 'in_progress'
                ? this.msg.inProgress
                : this.msg.pending;
        return html`
            <li
                class="stage ${status}"
                role="listitem"
                title="${statusLabel}"
                @click=${() => this.selectStage(stage.stepId)}
            >
                <span class="mark" aria-hidden="true">${mark}</span>
                <span class="body">
                    <span class="title" title="${title}">${title}</span>
                    ${actor}
                    ${passes}
                </span>
            </li>
            ${index < total - 1 ? html`<li class="connector ${status}" aria-hidden="true"></li>` : html``}
        `;
    }

    private actorName(actorNow: string | null | undefined): string {
        if (!actorNow) return '';
        const known = this.actorNames[actorNow];
        if (known !== undefined) return known;
        if (!this.actorLoads.has(actorNow)) {
            this.actorLoads.add(actorNow);
            getUser(actorNow).then((user) => {
                this.actorNames = { ...this.actorNames, [actorNow]: user?.name ?? '' };
            }).catch((err) => {
                console.error('Failed to read the stage actor from local users.', err);
                this.actorNames = { ...this.actorNames, [actorNow]: '' };
            });
        }
        return '';
    }

    private selectStage(stepId: number) {
        this.dispatchEvent(new CustomEvent('step-select', {
            detail: stepId,
            bubbles: true,
            composed: true,
        }));
    }
}
