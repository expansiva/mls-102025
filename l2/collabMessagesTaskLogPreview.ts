/// <mls shortName="collabMessagesTaskLogPreview" project="102025" enhancement="_100554_enhancementLit" />

import { html, TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { StateLitElement } from '/_100554_/stateLitElement.js';
import { getRootAgent } from '/_100554_/aiAgentHelper.js';
import { IAgent } from '/_100554_/aiAgentBase.js';
import { loadAgent } from '/_100554_/aiAgentOrchestration.js';

@customElement('collab-messages-task-log-preview-102025')
export class CollabMessagesTaskLogPreview extends StateLitElement {

  @property() task: mls.msg.TaskData | undefined = undefined;

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
    const message: mls.msg.Message = context.message;
    const _task: mls.msg.TaskData = context.task;
    if (this.task.PK !== _task.PK) return;
    this.task = _task;
    this.createFeedBack();
  };

  private async createFeedBack() {
    if (!this.task) return;
    const firstAgent = getRootAgent(this.task);
    if (!firstAgent) return;
    const agentName = firstAgent.agentName;
    const info = mls.l2.getPath(`_${mls.actualProject}_${agentName} `);
    const agent: IAgent | undefined = await loadAgent(info.shortName, info.folder);
    if (!agent || !agent.getFeedBack) return;
    const html = await agent.getFeedBack(this.task);
    this.template = html;
  }
}
