/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewRaw.ts" enhancement="_102025_/l2/enhancementLit"/>

import { html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { CollabLitElement } from '/_102027_/l2/collabLitElement.js';
import { getTotalCost } from '/_102027_/l2/aiAgentHelper.js';
import { collab_money } from '/_102025_/l2/collabMessagesIcons.js';

type TabMode = 'flexible' | 'info' | 'result';

@customElement('collab-messages-task-preview-raw-102025')
export class CollabMessagesTaskPreviewRaw extends CollabLitElement {

    @state() private mode: TabMode = 'flexible';
    @property({ type: Object }) message: mls.msg.Message | null = null;
    @property({ type: Object }) task: mls.msg.TaskData | null = null;
    @property({ type: Object }) step: mls.msg.AIFlexibleResultStep | null = null;
    @property({ type: String }) msize = '';

    @query('#elEditor') elEditor: IHTMLEditorElement | undefined;
    private resizeObserver: ResizeObserver | undefined;

    private get sharedEditor(): IHTMLEditorElement {
        return (window as any).elEditorTaskView;
    }

    private get sharedMonaco(): monaco.editor.IStandaloneCodeEditor {
        return (window as any).editorTaskView;
    }

    async firstUpdated() {
        if (this.mode === 'flexible') {
            this.mountEditor();
            this.updateEditorContent();
        }
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.resizeObserver?.disconnect();
    }

    updated(changedProps: Map<string, any>) {
        if (changedProps.has('mode') && this.mode === 'flexible') {
            this.mountEditor();
            this.updateEditorContent();
        }

        if (changedProps.has('step') && this.mode === 'flexible') {
            this.updateEditorContent();
        }

        if (changedProps.has('msize')) {
            this.sharedEditor?.setAttribute('msize', this.msize);
            this.layoutEditor();
        }
    }

    // ── Editor lifecycle ──────────────────────────────────────────────────────

    private ensureEditorCreated(): void {
        if (this.sharedMonaco) return;

        const editorEl = document.createElement('mls-editor-100529') as IHTMLEditorElement;
        editorEl.style.cssText = 'width:100%; height: calc(100% - 102px)';

        const model = this.createModel();
        const ed1 = monaco.editor.create(editorEl, this.editorConf as monaco.editor.IEditorOptions);
        monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ noImplicitAny: true });
        ed1.updateOptions({ readOnly: true });
        ed1.setModel(model);
        editorEl.mlsEditor = ed1;

        (window as any).elEditorTaskView = editorEl;
        (window as any).editorTaskView = ed1;
    }

    /**
     * Called every time the flexible tab becomes visible.
     * Creates the shared editor once, then re-appends it to the fresh #elEditor node.
     */
    private mountEditor(): void {
        if (!this.elEditor) return;
        this.ensureEditorCreated();
        this.elEditor.appendChild(this.sharedEditor as any);
        this.observeEditorHost();
        this.layoutEditor();
    }

    private observeEditorHost(): void {
        if (!this.elEditor) return;
        this.resizeObserver?.disconnect();
        this.resizeObserver = new ResizeObserver(() => this.layoutEditor());
        this.resizeObserver.observe(this.elEditor);
    }

    private createModel(): monaco.editor.ITextModel {
        const uri = monaco.Uri.parse('file://server/taskViewModel.ts');
        return monaco.editor.getModel(uri)
            ?? monaco.editor.createModel('', 'javascript', uri);
    }

    private updateEditorContent(): void {
        const ed1 = this.sharedMonaco;
        if (!ed1 || !this.task) return;
        const value = JSON.stringify(this.task, null, 2);
        ed1.getModel()?.setValue(value);
        this.layoutEditor();
    }

    private layoutEditor(): void {
        const editor = this.sharedMonaco;
        const host = this.elEditor;
        if (!editor || !host) return;
        requestAnimationFrame(() => {
            const rect = host.getBoundingClientRect();
            if (rect.width > 0 && rect.height > 0) {
                editor.layout({ width: rect.width, height: rect.height });
            } else {
                editor.layout();
            }
        });
    }

    // ── Render ────────────────────────────────────────────────────────────────

    render() {
        
        return html`
            <div class="raw-shell">
                <div class="tab-header">
                    <div class="tab-group-left">
                        <button class="tab-button ${this.mode === 'info' ? 'active' : ''}"
                            @click=${() => this.setMode('info')}>Info</button>
                        <button class="tab-button ${this.mode === 'flexible' ? 'active' : ''}"
                            @click=${() => this.setMode('flexible')}>Raw</button>
                    </div>
                </div>
                <div class="tab-content">
                    ${this.renderMode()}
                </div>
            </div>
        `;
    }

    private setMode(mode: TabMode): void {
        this.mode = mode;
    }

    private renderMode() {
        switch (this.mode) {
            case 'flexible': return this.renderFlexible();
            case 'info':     return this.renderInfo();
            case 'result':   return this.renderResults();
            default:         return this.renderInfo();
        }
    }

    private renderInfo() {
        if (!this.task ) return html`Not found!`;

        return html`
            <div class="containerinputs">
                <details open>
                    <summary>${this.renderSummary('Task')}</summary>
                    <div>
                        <b>${this.task.PK}</b> 
                        <span>${this.task.status}</span> 
                        <span>${collab_money} ${getTotalCost(this.task)}</span>
                    </div>
                    ${this.renderTaskModeDetails()}
                </details>
            </div>
        `;
    }

    private renderTaskModeDetails() {
        return html`
            ${this.renderTaskInfo()}
            ${this.renderlLongMemory()}
        `
    }


    private renderTaskInfo() {

        if (!this.task) return html``;
        const cloneTask = Object.assign({}, this.task);
        delete cloneTask.iaCompressed;

        return html`
            <div class="task-info">
                <h4>Details</h4>
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

    private renderlLongMemory() {
        if (!this.task || !this.task.iaCompressed?.longMemory) return html``
        return html`
            
            <div class="task-info">
                <h4>LongMemory</h4>
                <ul>
                ${Object.keys(this.task.iaCompressed?.longMemory).map((key) => {
            return html`<li>${key}:${this.task?.iaCompressed?.longMemory[key]}</li>`
        })}
            </ul>
            </div>
        `
    }


    private renderSummary(title: string) {
        return html`
            <div class="pheader">
                <div style="display:flex; align-items:center; gap:.5rem">
                    <span>${title}</span>
                </div>
                <div style="display:flex; gap:.5rem">
                    <div class="chevron">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" style="width:10px">
                            <path d="M310.6 233.4c12.5 12.5 12.5 32.8 0 45.3l-192 192c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3L242.7 256 73.4 86.6c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l192 192z"/>
                        </svg>
                    </div>
                </div>
            </div>
        `;
    }

    private renderFlexible() {
        return html`<div id="elEditor" style="width:100%; height:100%"></div>`;
    }

    private renderResults() {
        if (!this.step) return html`Not found step`;

        const nextOptions: any[] = [
            ...(this.step.interaction?.payload ?? []),
            ...(this.step.nextSteps ?? []),
        ];

        return html`
            <ul>
                ${nextOptions.length === 0
                    ? html`<li><em>Not next step</em></li>`
                    : nextOptions.map((ns) => html`<li>[${ns.stepId}] ${ns.type} - ${ns.agentName}</li>`)
                }
            </ul>
        `;
    }

    // ── Editor config ─────────────────────────────────────────────────────────

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
}

interface IHTMLEditorElement extends HTMLElement {
    mlsEditor: monaco.editor.IStandaloneCodeEditor;
}
