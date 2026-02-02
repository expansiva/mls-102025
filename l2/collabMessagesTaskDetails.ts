/// <mls shortName="collabMessagesTaskDetails" project="102025" enhancement="_blank" />

import { html, TemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { StateLitElement } from '/_100554_/l2/stateLitElement.js';

import {
    getNextResultStep,
    getNextPendentStep,
    getNextClarificationStep,
    getInteractionStepId,
    getStepById,
    getTotalCost, getTemporaryContext
} from '/_100554_/l2/aiAgentHelper.js';

import { getClarification } from '/_100554_/l2/aiAgentOrchestration.js';
import { collab_money } from '/_102025_/l2/collabMessagesIcons.js';
import { IAgent } from '/_100554_/l2/aiAgentBase.js';

@customElement('collab-messages-task-details-102025')
export class CollabMessagesTaskDetails extends StateLitElement {

    @property() task: mls.msg.TaskData | undefined = undefined;
    @property() stepid: string = '';
    @property({ attribute: false }) seen = new Set<string>();

    @property() interactionClarification: mls.msg.AIAgentStep | undefined;
    @query('.direct-clarification') directClarification: HTMLElement | undefined;
    @query('.direct-clarification .content') directClarificationContent: HTMLElement | undefined;

    disconnectedCallback() {
        window.removeEventListener('task-change', this.onTaskChange.bind(this));
    }

    async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
        super.firstUpdated(changedProperties);
        window.addEventListener('task-change', this.onTaskChange.bind(this));
        if (this.interactionClarification) {
            this.setClarification();
        }
    }

    render() {

        if (!this.task) return html`No task.`;

        let isClarificationPending: boolean = false;
        if (this.task) {
            const nextStepPending = getNextPendentStep(this.task);
            if (nextStepPending?.type === 'clarification') isClarificationPending = true;
        }
        return html`

            <div class="task-short-info">
                <div>
                    <b>${this.task.PK}</b> 
                    <span>${this.task.status}</span> 
                    <span>${collab_money} ${getTotalCost(this.task)}</span>
                </div>

            </div>
            
            <details class="details-task">
                <summary>Details</summary>
                <div>
                    <details>
                        <summary>Raw</summary>
                        <div>
                            ${this.renderTaskModeJson()}
                        </div>
                    </details>
                    ${this.renderTaskModeDetails()}
                </div>
            </details>
            
            ${this.task?.status === "done"
                ? this.renderDirectResult()
                : html``
            }

            ${isClarificationPending
                ? this.renderDirectClarification()
                : html``
            }

            `
    }

    private renderTaskModeJson() {
        if (!this.task) return html``;
        const formattedJson = this.syntaxHighlight(this.task);
        return html`<div class="formated-details-json"><pre .innerHTML=${formattedJson}></pre></div>`;
    }

    private renderTaskModeDetails() {
        return html`
            ${this.renderTaskInfo()}
            ${this.renderlLongMemory()}
            ${this.task?.iaCompressed?.nextSteps ? this.renderTaskInteractions(this.task?.iaCompressed?.nextSteps) : ''}
        `
    }

    private renderDirectResult() {
        if (!this.task) throw new Error('Invalid task');
        const payload = getNextResultStep(this.task);
        if (!payload) return html``;
        return this.renderResult(payload)
    }

    private renderDirectClarification() {
        if (!this.task) throw new Error('Invalid task');
        const payload = getNextClarificationStep(this.task);
        if (!payload) return html``;
        return html`<div class="direct-clarification">${this.renderClarification(payload)}</div>`
    }

    private renderlLongMemory() {
        if (!this.task || !this.task.iaCompressed?.longMemory) return html``
        return html`
            <h4>LongMemory</h4>
            <ul>
                ${Object.keys(this.task.iaCompressed?.longMemory).map((key) => {
            return html`<li>${key}:${this.task?.iaCompressed?.longMemory[key]}</li>`
        })}
            </ul>
        `
    }

    private renderTaskInfo() {

        if (!this.task) return html``;
        const cloneTask = Object.assign({}, this.task);
        delete cloneTask.iaCompressed;

        return html`
            <div class="task-info">
                <ul>
                    ${Object.keys(cloneTask).map((key) => {
            return html`
                            <li>${key}: 
                            ${cloneTask && typeof (cloneTask as any)[key] === 'string'
                    ? (cloneTask as any)[key]
                    : (cloneTask as any)[key].toString()
                } </li>`
        })}
                </ul>             
            </div>
        `
    }

    private renderTaskInteractions(payloads: mls.msg.AIPayload[]) {
        return html`
            <div class="payload-content">
                ${payloads.map((payload) => {
            return html`
                <div>
                    ${this.renderPayload(payload)}
                </div>`
        })}
            </div>
        `
    }

    private renderPayload(payload: mls.msg.AIPayload, isDirect: boolean = false): TemplateResult<1> {


        switch (payload.type) {
            case 'agent':
                return this.renderPayloadAgent(payload, isDirect);
            case 'tool':
                return html`
                    <details ?open=${isDirect} >
                        <summary>${payload.type}</summary>
                        ${this.renderTool(payload)}
                        ${payload.interaction ? this.renderInteration(payload.interaction, payload.stepId) : html``}
                        ${payload.nextSteps && payload.nextSteps.length > 0 ? this.renderTaskInteractions(payload.nextSteps) : html``}  
                    </details>
                `
            case 'clarification':
                return html`
                    <details ?open=${isDirect} >
                        <summary>${payload.type}</summary>
                        ${this.renderClarificationDetails(payload)}
                        ${payload.interaction ? this.renderInteration(payload.interaction, payload.stepId) : html``}
                        ${payload.nextSteps && payload.nextSteps.length > 0 ? this.renderTaskInteractions(payload.nextSteps) : html``}
                    </details>
                `
            case 'result':
                return html`
                    <details ?open=${isDirect} >
                        <summary>${payload.type}</summary>
                        ${this.renderResult(payload)}
                        ${payload.interaction ? this.renderInteration(payload.interaction, payload.stepId) : html``}
                        ${payload.nextSteps && payload.nextSteps.length > 0 ? this.renderTaskInteractions(payload.nextSteps) : html``}  
                    </details>
                `
            case 'flexible':
                return html`
                    <details ?open=${isDirect} >
                        <summary>${payload.type}</summary>
                        ${this.renderFlexible(payload)}
                        ${payload.interaction ? this.renderInteration(payload.interaction, payload.stepId) : html``}
                        ${payload.nextSteps && payload.nextSteps.length > 0 ? this.renderTaskInteractions(payload.nextSteps) : html``}  
                    </details>
                `
            default:
                return html`<p>Tipo de resultado desconhecido.</p>`;
        }
    }

    private renderPayloadAgent(payload: mls.msg.AIPayload, isDirect: boolean = false): TemplateResult<1> {

        if (payload.type !== 'agent') return html``;

        return html`
        <details ?open=${isDirect}>
            <summary>
                ${payload.type}(${payload.agentName})
                <span class="result"></span>
            </summary>
            ${this.renderAgent(payload)}
            ${payload.interaction ? this.renderInteration(payload.interaction, payload.stepId) : html``}
            ${payload.nextSteps && payload.nextSteps.length > 0 ? this.renderTaskInteractions(payload.nextSteps) : html``}  
        </details>`;

    }

    private renderInteration(interaction: mls.msg.AIInteraction, stepId: number) {

        return html` 
            <div class="interactions">
                <div class="cost">
                    ${collab_money} 
                    Cost: ${interaction.cost}
                </div>
                <details>
                    <summary>Inputs</summary>
                    <div>
                        <div class="prompts-content">
                            ${interaction.input.map((result, index) => html`
                                <div class="prompts-input-item">
                                    <span class="prompts-input-type">${result.type}</span>
                                    <span class="prompts-input-content"><pre>${result.content}</pre></span>
                                </details>
                            `)}
                        </div>
                    </div>
                </details>

                <details>
                    <summary>Trace</summary>
                    <div>
                        <div class="trace-content">
                            <pre>${interaction?.trace?.join('\n')}</pre>
                        </div>
                    </div>
                </details>

                ${interaction.payload && interaction.payload.length > 0
                ? html`
                        <details>
                            <summary>Payload</summary>
                            <div>
                                <div class="payload-content">
                                    ${interaction.payload?.map((payl) => { return this.renderPayload(payl) })}
                                </div>
                            </div>
                        </details>`
                : html``
            }
                
            </div>`
    }

    private renderAgent(payload: mls.msg.AIAgentStep) {
        return html`
            <ul>
                <li>agentName: ${payload.agentName}</li> 
                <li>stepId: ${payload.stepId}</li>
                <li>prompt: ${payload.prompt}</li>
                <li>status: ${payload.status}</li>
            </ul>
        `;
    }

    private renderTool(payload: mls.msg.AIToolStep) {
        return html`
            <ul>
                <li>toolName: ${payload.toolName}</li>
                <li>stepId: ${payload.stepId}</li>
                <li>status: ${payload.status}</li>
            </ul>
            <div class="clarification-details">
                <pre>${JSON.stringify(payload)}</pre>
            </div>`;

    }

    private renderClarificationDetails(payload: mls.msg.AIClarificationStep) {
        return html`
            <ul>
                <li>json: ${payload.json}</li>
                <li>stepId: ${payload.stepId}</li>
                <li>status: ${payload.status}</li>
            </ul>
            ${payload.json ? html`<div class="clarification-details"><pre>${JSON.stringify(payload.json)}</pre></div>` : ''}
            `;

    }

    private renderFlexible(payload: mls.msg.AIFlexibleResultStep) {
        return html`
            <ul>
                <li>stepId: ${payload.stepId}</li>
                <li>status: ${payload.status}</li>
            </ul>
            <div class="flexible-details">
                <pre>${JSON.stringify(payload)}</pre>
            </div>
            `;
    }

    private renderClarification(payload: mls.msg.AIClarificationStep) {

        if (!this.task) return html`Invalid task`;
        const parentInteraction = getInteractionStepId(this.task, payload.stepId);
        if (!parentInteraction) return html`No found parentInteraction ${payload.stepId} on task: ${this.task.PK} `;
        const interaction = getStepById(this.task, parentInteraction) as mls.msg.AIAgentStep;
        this.interactionClarification = interaction;
        if (!interaction) return html`Invalid interaction id:${parentInteraction} on task: ${this.task.PK} `
        if (!interaction.agentName) return html`Invalid agent name for step id:${interaction.stepId} on task: ${this.task.PK} `
        return html`<div class="content"> Processing...</div>`

    }
    private renderResult(payload: mls.msg.AIResultStep) {
        return html`
            <div class="result">
                <pre>${typeof payload.result === 'object' ? JSON.stringify(payload.result) : payload.result}</pre>
            </div>`;
    }

    private async setClarification(): Promise<void> {
        if (!this.directClarificationContent || !this.task) return;
        const clarification = await getClarification(this.task.PK);
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

    private syntaxHighlight(json: any): string {
        if (typeof json !== 'string') {
            json = JSON.stringify(json, null, 2);
        }
        json = json
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        return json.replace(
            /("(\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
            (match: any) => {
                let cls = 'json-value';
                if (/^"/.test(match)) {
                    if (/:$/.test(match)) {
                        cls = 'json-key';
                    } else {
                        cls = 'json-string';
                    }
                } else if (/true|false/.test(match)) {
                    cls = 'json-boolean';
                } else if (/null/.test(match)) {
                    cls = 'json-null';
                }
                return `<span class="${cls}">${match}</span>`;
            }
        );
    }

    private onTaskChange(e: Event) {
        if (!this.task) return;
        const customEvent = e as CustomEvent;
        const task: mls.msg.TaskData = customEvent.detail.context.task;
        if (task.PK !== this.task.PK) return;
        this.task = task;
        this.requestUpdate();
    }

}