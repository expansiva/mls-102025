/// <mls fileReference="_102025_/l2/collabMessagesTaskLogPreview.ts" enhancement="_102027_/l2/enhancementLit" />

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { getRootAgent } from '/_102029_/l2/aiAgentHelper.js';
import { loadAgent } from '/_102029_/l2/aiAgentOrchestration.js';

import * as msg from '/_102025_/l2/shared/interfaces.js';
import { IAgent, IAgentAsync } from '/_102029_/l2/aiAgentBase.js';
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';


@customElement('collab-messages-task-log-preview-102025')
export class CollabMessagesTaskLogPreview extends StateLitElement {

  @property() task: msg.TaskData | undefined = undefined;
  @property() message: msg.Message | undefined = undefined;


  @state() template?: TemplateResult;

  async firstUpdated(changedProperties: Map<PropertyKey, unknown>) {
    window.addEventListener('task-change', this.onTaskChange);
    //this.task = await getTask('20250917143000.1001');
    this.createFeedBack();

  }

  disconnectedCallback() {
    super.disconnectedCallback();
    window.removeEventListener('task-change', this.onTaskChange);
  }

  render() {
    return html`
    <div>${this.template}</div>`;
  }

  private onTaskChange = async (e: Event) => {
    if (!this.task) return;
    const customEvent = e as CustomEvent;
    const context = customEvent.detail.context;
    const message: msg.Message = context.message;
    const _task: msg.TaskData = context.task;
    if (this.task.PK !== _task.PK) return;
    this.task = _task;
    this.createFeedBack();
  };

  private async createFeedBack() {

    if (!this.task) return;
    const firstAgent = getRootAgent(this.task);
    if (!firstAgent) return;
    const agentName = firstAgent.agentName;
    const agent: IAgent | IAgentAsync | undefined = await loadAgent(agentName);
    if (!agent || !agent.getFeedBack) {
      await import('/_102029_/l2/aiAgentDefaultFeedback.js');
      this.template = html`<ai-agent-default-feedback-102029 .task=${this.task} .message=${this.message}></ai-agent-default-feedback-102029>`
      return;
    }
    const html2 = await agent.getFeedBack(this.task);
    this.template = html2;
  }
}
