/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewFlexible.ts" enhancement="_102025_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { CollabLitElement } from '/_102027_/l2/collabLitElement.js';

type TabMode = 'flexible' | 'info' | 'result';

@customElement('collab-messages-task-preview-flexible-102025')
export class CollabMessagesTaskPreviewFlexible extends CollabLitElement {

    @state() private mode: TabMode = 'flexible';
    @property({ type: Object }) message: mls.msg.Message | null = null;
    @property({ type: Object }) task: mls.msg.TaskData | null = null;
    @property({ type: Object }) step: mls.msg.AIFlexibleResultStep | null = null;
    @property({ type: String }) msize = '';

    @query('#elEditor') elEditor: IHTMLEditorElement | undefined;

    private get sharedEditor(): IHTMLEditorElement {
        return (window as any).elEditorTaskView;
    }

    private get sharedMonaco(): monaco.editor.IStandaloneCodeEditor {
        return (window as any).editorTaskView;
    }

    async firstUpdated() {
        if (this.mode === 'flexible') {
            this.mountEditor();
        }
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
        }
    }

    // ── Editor lifecycle ──────────────────────────────────────────────────────

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
    }

    private createModel(): monaco.editor.ITextModel {
        const uri = monaco.Uri.parse('file://server/taskViewModel.ts');
        return monaco.editor.getModel(uri)
            ?? monaco.editor.createModel('', 'javascript', uri);
    }

    private updateEditorContent(): void {
        const ed1 = this.sharedMonaco;
        if (!ed1 || !this.step) return;
        const value = JSON.stringify(this.step.result, null, 2);
        ed1.getModel()?.setValue(value);
    }

    // ── Render ────────────────────────────────────────────────────────────────

    render() {
        if (!this.step) return html`<p>Step not Found.</p>`;

        return html`
            <div style="height: calc(100% - 41px);">
                <div class="tab-header">
                    <div class="tab-group-left">
                        <button class="tab-button ${this.mode === 'info' ? 'active' : ''}"
                            @click=${() => this.setMode('info')}>Info</button>
                        <button class="tab-button ${this.mode === 'flexible' ? 'active' : ''}"
                            @click=${() => this.setMode('flexible')}>Flexible</button>
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
        if (!this.task || !this.step) return html`Not found!`;

        const progressLabel = this.step.status === 'in_progress' ? '(in progress)' : '';
        const lastUpdated = new Date(this.task.last_updated).toLocaleString();
        const cost = this.step.interaction?.cost ?? '0';

        return html`
            <div class="containerinputs">
                <details open>
                    <summary>${this.renderSummary(`Flexible ${progressLabel}`)}</summary>
                    <ul>
                        <li>#${this.step.stepId} - ${this.step.type} - ${this.step.status} - $${cost}</li>
                    </ul>
                </details>
                <details>
                    <summary>${this.renderSummary('Task details')}</summary>
                    <ul>
                        <li>
                            <header>
                                <h2>${this.task.PK}</h2>
                                <small>Status: ${this.task.status} | Última atualização: ${lastUpdated}</small>
                                <br/><small>${this.task.title}</small>
                            </header>
                        </li>
                    </ul>
                </details>
                <details>
                    <summary>${this.renderSummary('Message details')}</summary>
                    <ul>
                        <li><pre>${JSON.stringify(this.message, null, 2)}</pre></li>
                    </ul>
                </details>
            </div>
        `;
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
        if (!this.step) return html`
            <div class="containerinputs"><h3>No input found!</h3></div>
        `;

        if (this.step.result?.dataUrl) {
            return html`
                <div style="max-width:520px; margin:0 auto; text-align:center;">
                    <figure style="margin:0;">
                        <img
                            src="${this.step.result.dataUrl}"
                            alt="${this.step.result.dataUrl}"
                            style="width:100%; height:auto; display:block; border-radius:12px; box-shadow:0 6px 18px rgba(0,0,0,0.12);"
                        />
                        <figcaption style="margin-top:10px; font-size:14px; color:#555; line-height:1.4;">
                            ${this.step.result.dataUrl}
                        </figcaption>
                    </figure>
                </div>
            `;
        }

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