/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewAgent.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { repeat } from 'lit/directives/repeat.js';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import { customElement, property, state, query } from 'lit/decorators.js';
import { CollabLitElement } from '/_102027_/l2/collabLitElement.js';
import { loadAgent, restartStep } from '/_102027_/l2/aiAgentOrchestration.js';

@customElement('collab-messages-task-preview-agent-102025')
export class CollabMessagesTaskPreviewAgent extends CollabLitElement {

    @property({ type: Object }) message: mls.msg.Message | null = null;
    @property({ type: Object }) task: mls.msg.TaskData | null = null;
    @property({ type: Object }) step: mls.msg.AIAgentStep | null = null;
    @property({ type: String }) agentDescription: string = '';
    
    @state() private prompts: mls.msg.IAMessageInputType[] = [];
    @state() private mode: string = 'info';

    @query('#elEditor') elEditor: IHTMLEditorElement | undefined;

    private lastKey: number = -1;

    // Dedicated monaco instance for the Payload tab. It must NOT share the
    // singleton used by the Raw/Flexible previews (window.editorTaskView),
    // otherwise they overwrite each other's content (the Raw step-0 view would
    // show a payload, and the payload would show the last set value).
    private get sharedEditor(): IHTMLEditorElement {
        return (window as any).elEditorAgentPayload;
    }

    private get sharedMonaco(): monaco.editor.IStandaloneCodeEditor {
        return (window as any).editorAgentPayload;
    }

    firstUpdated() {
        this.init();
        if (this.mode === 'payload') {
            this.mountEditor();
            this.updateEditorContent();
        }
    }

    update(changedProperties: any) {
        super.update(changedProperties);
        this.init();
    }

    updated(changedProperties: Map<string, any>) {
        if ((changedProperties.has('mode') || changedProperties.has('step') || changedProperties.has('task')) && this.mode === 'payload') {
            this.mountEditor();
            this.updateEditorContent();
        }
    }

    render() {

        if (!this.step) {
            return html`<p>Step not Found.</p>`;
        }

        return html`
            <div style="height: calc(100% - 41px);">
                <div class="tab-header">
                    <div class="tab-group-left">
                        <button
                            class="tab-button ${this.mode === 'info' ? 'active' : ''}" @click=${() => this.selectTabInfo()} >
                            Info                            
                        </button>
                        <button
                            class="tab-button ${this.mode === 'input' ? 'active' : ''}" @click=${() => this.selectTabInput()} >
                            Inputs
                        </button>
                        <button
                            class="tab-button ${this.mode === 'payload' ? 'active' : ''}" @click=${() => this.selectTabPayload()} >
                            Payload
                        </button>

                    </div>
                </div>
                <div class="tab-content">
                    ${this.renderMode()}
                    
                </div>
            </div>
        `;

    }

    renderMode() {

        switch (this.mode) {
            case 'input': return this.renderInputs();
            case 'payload': return this.renderPayload();
            case 'info': return this.renderInfo();
            case 'result': return this.renderResults();
            default: return this.renderInputs();
        }

    }

    renderInfo() {

        if (!this.task || !this.step) return html`Not found!`;

        let trace = '';
        if (this.step.interaction && Array.isArray(this.step.interaction.trace)) {
            this.step.interaction.trace.forEach((i) => trace += `<p>${i}<p>`)
        } else if (this.step.interaction) {
            trace = this.step.interaction.trace as any;
        }

        const aux = this.step.status === 'in_progress' ? '(in progress)' : '';

        return html`
        <div class="containerinputs">
            <details open>
                <summary> ${this.renderSummary('Agent ' + aux)} </summary>
                <ul>
                    <li>
                        #${this.step.stepId} - ${this.step.agentName} - ${this.step.status} - $${this.step.interaction?.cost}
                    </li>
                    <li>
                        <b>Trace: </b>${unsafeHTML(trace)}
                    </li>
                    <li>
                        <b>${this.step.agentName}: </b>${this.agentDescription}
                    </li>
                </ul>
            </details>
            <details>
                <summary> ${this.renderSummary('Task details')}</summary>
                <ul>
                    <li>
                        <header>
                                <h2>${this.task.PK}</h2>
                                <small>Status: ${this.task.status} | Última atualização: ${new Date(
            this.task.last_updated
        ).toLocaleString()}</small>
                        <br/><small>${this.task.title}</small>
                        </header>
                    </li>
                </ul>
            </details>
            <details>
                <summary> ${this.renderSummary('Message details')}</summary>
                <ul>
                    <li>
                        <pre>
                            ${JSON.stringify(this.message, null, 2)}
                        </pre>
                    </li>
                </ul>
            </details>
            <details>
                <summary>${this.renderSummary('Advanced details')} </summary>
                <ul>
                    <li>
                        <span>Execute</span>
                        <div style="float: right;">
                            ${this.canRestartStep()
            ? html`
                            <span>(run again - restart step)</span>
                            <svg xmlns="http://www.w3.org/2000/svg" style="transform: rotateY(174deg); z-index:9999;width:15px; cursor:pointer" @click=${(e: MouseEvent) => { e.stopPropagation(); e.preventDefault(); this.restartStep(e.currentTarget as HTMLElement, (this.step as mls.msg.AIAgentStep).stepId) }} viewBox="0 0 576 512"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M209.4 39.5c-9.1-9.6-24.3-10-33.9-.9L33.8 173.2c-19.9 18.9-19.9 50.7 0 69.6L175.5 377.4c9.6 9.1 24.8 8.7 33.9-.9s8.7-24.8-.9-33.9L66.8 208 208.5 73.4c9.6-9.1 10-24.3 .9-33.9zM352 64c0-12.6-7.4-24.1-19-29.2s-25-3-34.4 5.4l-160 144c-6.7 6.1-10.6 14.7-10.6 23.8s3.9 17.7 10.6 23.8l160 144c9.4 8.5 22.9 10.6 34.4 5.4s19-16.6 19-29.2l0-64 32 0c53 0 96 43 96 96c0 30.4-12.8 47.9-22.2 56.7c-5.5 5.1-9.8 12-9.8 19.5c0 10.9 8.8 19.7 19.7 19.7c2.8 0 5.6-.6 8.1-1.9C494.5 467.9 576 417.3 576 304c0-97.2-78.8-176-176-176l-48 0 0-64z"/></svg>
                            <span class="result"></span>`
            : html`<span style="opacity:.6">(restart available only for failed steps with planning)</span>`}
                        </div>
                    </li>
                </ul>
            </details>
        </div>
        `;
    }

    renderSummary(title: string) {
        return html`
            <div class="pheader">
                <div style="display:flex; align-items: center;gap:.5rem">
                    <span>
                        ${title}
                    </span>
                </div>
                <div style="display:flex; gap:.5rem">
                    <div class="chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width:10px"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
                    </div>
                </div>
            </div>
        `
    }

    renderInputs() {

        const hasPrompts = this.prompts && this.prompts.length > 0;
        const tools = this.step?.interaction?.tools;
        const hasTools = Array.isArray(tools) && tools.length > 0;
        const toolChoice = this.step?.interaction?.toolChoice;

        if (!hasPrompts && !hasTools)
            return html`
            <div class="containerinputs">
                <h3>No input found!</h3>
            </div>
        `;

        return html`
        <div class="containerinputs containerdraganddrop">
            ${hasPrompts
                ? repeat(this.prompts, ((key: mls.msg.IAMessageInputType) => key.type + Date.now()) as any, ((p: mls.msg.IAMessageInputType, idx: number) => { return this.renderPrompt(p, idx) }) as any)
                : ''}
            ${hasTools ? this.renderTools(tools as any[], toolChoice) : ''}
        </div>
        `
    }

    renderTools(tools: any[], toolChoice: any) {
        return html`
            ${toolChoice ? this.renderJsonCard('toolChoice', this.toolName(toolChoice) || 'toolChoice', toolChoice) : ''}
            ${tools.map((tool) => this.renderJsonCard('tool', this.toolName(tool) || 'tool', tool))}
        `;
    }

    private toolName(tool: any): string {
        return tool?.function?.name ?? tool?.name ?? '';
    }

    private renderJsonCard(typeMode: string, title: string, value: unknown) {
        const content = JSON.stringify(value, null, 2);
        return html`
            <details class="prompt ${typeMode}">
                <summary>
                    <div class="pheader">
                        <div class="type" style="display:flex; align-items: center;gap:.5rem">
                            <span class="typeMode">${typeMode}</span>
                            <span class="title">${title}</span>
                        </div>
                        <div style="display:flex; gap:.5rem">
                            <div class="chevron">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width:10px"><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
                            </div>
                        </div>
                    </div>
                </summary>
                <div>
                    <pre class="content">${content}</pre>
                </div>
            </details>
        `;
    }

    renderPayload() {
        const payload = this.step?.interaction?.payload;
        if (!payload || (Array.isArray(payload) && payload.length === 0)) {
            return html`
            <div class="containerinputs">
                <h3>No payload found!</h3>
            </div>
        `;
        }
        requestAnimationFrame(() => this.updateEditorContent());
        return html`<div id="elEditor" style="width:100%; height:100%"></div>`;
    }

    renderPrompt(prompt: mls.msg.IAMessageInputType, idx: number) {

        let pp = prompt.content.trim();
        return html`
            <details class="prompt ${prompt.type}" >
                <summary>
                    <div class="pheader">
                        <div class="type" style="display:flex; align-items: center;gap:.5rem">
                            <span class="typeMode">${prompt.type}</span>
                            <span class="title">
                                ${pp.substring(0, 50)}...
                            </span>
                        </div>
                        <div style="display:flex; gap:.5rem">
                            <div class="chevron">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width:10px"><!--!Font Awesome Free 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.--><path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/></svg>
                            </div>
                        </div>
                    </div>
                </summary>
                <div>
                    <pre class="content">${pp}</pre>
                </div>
            </details>
        `;
    }

    renderResults() {

        if (!this.step) return html`Not found step`;

        const nextOptions: any[] = [];
        if (this.step.interaction?.payload) {
            nextOptions.push(...this.step.interaction.payload);
        }
        if (this.step.nextSteps) {
            nextOptions.push(...this.step.nextSteps);
        }

        return html`
        <ul>
            ${nextOptions.length === 0 ? html`<li><em>Not next step</em></li>`
                : nextOptions.map((ns) => html` <li> [${ns.stepId}] ${ns.type} - ${ns.agentName} </li> `)}
        </ul>
        `
    }//<li @click=${() => this.navigateToStep(ns.stepId)}> [${ns.stepId}] ${ns.type} - ${ns.agentName} </li>



    //------IMPLEMENTATION----------

    private async init() {

        if (this.step && this.step.stepId === this.lastKey) return;
        this.lastKey = this.step?.stepId || -1;
        this.getPrompts();
        await this.getDescription();
    }

    private async getDescription() {

        if (!this.step || !this.step.agentName) return;

        try {
            const agent = await loadAgent(this.step.agentName);
            if (!agent) return;
            if (!agent || !agent.agentDescription) return;
            this.agentDescription = agent.agentDescription;

        } catch (e) {

        }

    }

    private getPrompts() {

        if (this.step && this.step.interaction && this.step.interaction.input) {
            this.prompts = this.step.interaction.input;
        } else {
            this.prompts = [];
        }

    }

    private selectTabInput() {
        this.mode = 'input';
    }

    private selectTabInfo() {
        this.mode = 'info';
    }

    private selectTabResult() {
        this.mode = 'result';
    }

    private selectTabPayload() {
        this.mode = 'payload';
    }

    // ── Monaco editor (dedicated instance for the Payload tab) ────

    private ensureEditorCreated(): void {
        if (this.sharedMonaco) return;

        const editorEl = document.createElement('mls-editor-100529') as IHTMLEditorElement;
        editorEl.style.cssText = 'width:100%; height:100%';

        const model = this.createModel();
        const ed1 = monaco.editor.create(editorEl, this.editorConf as monaco.editor.IEditorOptions);
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noImplicitAny: true });
        ed1.updateOptions({ readOnly: true });
        ed1.setModel(model);
        editorEl.mlsEditor = ed1;

        (window as any).elEditorAgentPayload = editorEl;
        (window as any).editorAgentPayload = ed1;
    }

    private mountEditor(): void {
        if (!this.elEditor) return;
        this.ensureEditorCreated();
        this.elEditor.appendChild(this.sharedEditor as any);
    }

    private createModel(): monaco.editor.ITextModel {
        const uri = monaco.Uri.parse('file://server/agentPayloadModel.ts');
        return monaco.editor.getModel(uri)
            ?? monaco.editor.createModel('', 'javascript', uri);
    }

    private updateEditorContent(): void {
        const ed1 = this.sharedMonaco;
        if (!ed1 || !this.step) return;
        const value = JSON.stringify(this.step.interaction?.payload ?? null, null, 2);
        ed1.getModel()?.setValue(value);
    }

    private readonly editorConf: monaco.editor.IEditorOptions = {
        contextmenu: true,
        autoIndent: 'full',
        wordWrap: 'on',
        wrappingIndent: 'indent',
        tabCompletion: 'on',
        renderControlCharacters: false,
        showUnused: true,
        glyphMargin: true,
        minimap: { enabled: false },
        useTabStops: true,
        scrollBeyondLastColumn: 2,
        scrollBeyondLastLine: false,
        formatOnType: true,
        fixedOverflowWidgets: true,
        codeLens: true,
        showFoldingControls: 'mouseover',
        suggestSelection: 'first',
        stickyScroll: { enabled: false, maxLineCount: 3 },
        stickyTabStops: true,
        fontSize: 14,
        automaticLayout: true,
    };

    private canRestartStep(): boolean {
        return !!this.step && this.step.status === 'failed' && !!this.step.planning;
    }

    private async restartStep(el: HTMLElement, stepId: number) {

        const sum = el?.closest('div');
        let result: HTMLElement | undefined;
        if (sum) result = sum.querySelector('.result') as HTMLElement;
        if (result) result.innerText = '';

        if (!this.task || !this.message) {
            if (result) result.innerText = 'result: no task/message';
            return;
        }

        const cleaner: 'input_output' | undefined =
            window.confirm('Clear inputs and outputs of this step?') ? 'input_output' : undefined;

        el.classList.add('rotate');

        try {
            const context: mls.msg.ExecutionContext = {
                task: this.task,
                message: this.message,
                isTest: false,
            };
            await restartStep(context, stepId, cleaner);
            if (result) result.innerText = 'result: Ok';
        } catch (e: any) {
            console.info(e);
            if (result) result.innerText = e && e.message ? 'result: ' + e.message : 'result: Erro';
        } finally {
            el.classList.remove('rotate');
        }

    }

}

interface IHTMLEditorElement extends HTMLElement {
    mlsEditor: monaco.editor.IStandaloneCodeEditor;
}
