/// <mls fileReference="_102025_/l2/collabMessagesTaskInfo.ts" enhancement="_102027_/l2/enhancementLit" />

import { html } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js'; 
import { StateLitElement } from '/_102029_/l2/stateLitElement.js';
import { getClarificationElement, continuePoolingTask } from '/_102027_/l2/aiAgentOrchestration.js';
import { getAllSteps, getNextPendentStep, getNextClarificationStep, getInteractionStepId, getStepById } from '/_102027_/l2/aiAgentHelper.js';

import '/_102025_/l2/collabMessagesTaskDetails.js';
import '/_102025_/l2/collabMessagesTaskPreview.js';
import '/_102025_/l2/collabMessagesTaskLogPreview.js';
import '/_102025_/l2/collabMessagesTaskRoom.js';

/// **collab_i18n_start**
const message_pt = {
    statistics: 'Estatísticas',
    statisticsTitle: 'Estatísticas da execução',
    statisticsSubtitle: 'Custos, tokens, modelos, tempo, erros e fallbacks extraídos dos traces.',
    totalCost: 'Custo total',
    llmCalls: 'Chamadas LLM',
    totalTokens: 'Tokens totais',
    executionTime: 'Tempo total',
    llmTime: 'Tempo LLM',
    errorsFallbacks: 'Erros / fallbacks',
    inputTokens: 'Tokens in',
    outputTokens: 'Tokens out',
    tps: 'TPS',
    cost: 'Custo',
    calls: 'Chamadas',
    model: 'Modelo',
    modelsUsed: 'Modelos usados',
    stepStatus: 'Status dos steps',
    traceQuality: 'Qualidade dos traces',
    traceQualityValue: 'JSON',
    traceQualityHelp: 'Quanto mais traces em JSON, melhor a análise automática.',
    errorsTitle: 'Erros e fallbacks',
    noErrors: 'Nenhum erro encontrado nos traces.',
    noModels: 'Nenhuma chamada LLM com tokens/custo foi encontrada nos traces.',
    noStatistics: 'Sem traces suficientes para estatísticas.',
    stepTypes: 'Tipos de step',
    slowCalls: 'Chamadas mais lentas',
    total: 'total',
    failedSteps: 'steps falhos',
    fallbacks: 'fallbacks',
};

const message_en = {
    statistics: 'Statistics',
    statisticsTitle: 'Execution statistics',
    statisticsSubtitle: 'Costs, tokens, models, timing, errors and fallbacks extracted from traces.',
    totalCost: 'Total cost',
    llmCalls: 'LLM calls',
    totalTokens: 'Total tokens',
    executionTime: 'Total time',
    llmTime: 'LLM time',
    errorsFallbacks: 'Errors / fallbacks',
    inputTokens: 'Tokens in',
    outputTokens: 'Tokens out',
    tps: 'TPS',
    cost: 'Cost',
    calls: 'Calls',
    model: 'Model',
    modelsUsed: 'Models used',
    stepStatus: 'Step status',
    traceQuality: 'Trace quality',
    traceQualityValue: 'JSON',
    traceQualityHelp: 'More JSON traces means better automatic analysis.',
    errorsTitle: 'Errors and fallbacks',
    noErrors: 'No errors found in traces.',
    noModels: 'No LLM call with tokens/cost was found in traces.',
    noStatistics: 'Not enough traces for statistics.',
    stepTypes: 'Step types',
    slowCalls: 'Slowest calls',
    total: 'total',
    failedSteps: 'failed steps',
    fallbacks: 'fallbacks',
};

type MessageType = typeof message_en;
const messages: { [key: string]: MessageType } = {
    en: message_en,
    pt: message_pt
};
/// **collab_i18n_end**

type TaskInfoTab = 'workflow' | 'step' | 'raw' | 'todo' | 'chat' | 'statistics';

type TraceRecord = {
    stepId: number;
    stepTitle: string;
    title: string;
    ok: boolean | undefined;
    lines: string[];
    isJson: boolean;
    raw: string;
    data?: Record<string, any>;
};

export type TaskLLMCall = {
    stepId: number;
    title: string;
    provider: string;
    model: string;
    alias: string;
    stage: string;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    llmMs: number;
};

export type TaskModelStatistic = {
    key: string;
    provider: string;
    model: string;
    alias: string;
    stage: string;
    calls: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    llmMs: number;
    tps: number;
};

export type TaskExecutionStatistics = {
    totalSteps: number;
    interactions: number;
    totalCost: number;
    interactionCost: number;
    traceCost: number;
    llmCalls: number;
    inputTokens: number;
    outputTokens: number;
    totalLlmMs: number;
    totalExecutionMs: number;
    errorCount: number;
    failedSteps: number;
    fallbackCount: number;
    traceRecords: number;
    jsonTraceRecords: number;
    byStatus: Record<string, number>;
    byType: Record<string, number>;
    models: TaskModelStatistic[];
    slowestCalls: TaskLLMCall[];
    errorLines: string[];
};

export function roundMoneyUpToCents(value: number): number {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return Math.ceil(value * 100) / 100;
}

function toNumber(value: unknown): number {
    if (typeof value === 'number' && Number.isFinite(value)) return value;
    if (typeof value === 'string') {
        const parsed = Number(value.replace('$', '').replace(',', '.'));
        return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
}

function parseDurationMs(value: string | undefined): number {
    if (!value) return 0;
    const parts = value.trim().split(':').map(Number);
    if (parts.some(part => Number.isNaN(part))) return 0;
    if (parts.length === 3) return ((parts[0] * 3600) + (parts[1] * 60) + parts[2]) * 1000;
    if (parts.length === 2) return ((parts[0] * 60) + parts[1]) * 1000;
    return parts[0] * 1000;
}

function parseTraceRecord(rawTrace: unknown, step: any): TraceRecord {
    const fallbackRaw = typeof rawTrace === 'string' ? rawTrace : JSON.stringify(rawTrace);
    let data: Record<string, any> | undefined;
    let isJson = false;

    if (typeof rawTrace === 'string') {
        const trimmed = rawTrace.trim();
        if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
            try {
                data = JSON.parse(trimmed);
                isJson = true;
            } catch (_error) {
                data = undefined;
            }
        }
    } else if (rawTrace && typeof rawTrace === 'object') {
        data = rawTrace as Record<string, any>;
        isJson = true;
    }

    const lines = Array.isArray(data?.trace)
        ? data?.trace.map((line: unknown) => String(line))
        : [fallbackRaw];

    return {
        stepId: Number(step.stepId || 0),
        stepTitle: String(step.stepTitle || step.agentName || step.toolName || step.type || ''),
        title: String(data?.title || step.stepTitle || step.agentName || step.toolName || step.type || ''),
        ok: typeof data?.ok === 'boolean' ? data.ok : undefined,
        lines,
        isJson,
        raw: fallbackRaw,
        data
    };
}

function parseLLMCallLine(line: string, record: TraceRecord): TaskLLMCall | null {
    if (!/\binputTokens:|\boutputTokens:|\bcost:\$?|\bllmTime:/i.test(line)) return null;

    const provider = line.match(/\bprovider:\s*([^\s]+)/i)?.[1] || '';
    const model = line.match(/\bmodel:\s*([^\s]+)/i)?.[1] || '';
    const alias = line.match(/\balias:\s*([^\s]+)/i)?.[1] || '';
    const stage = line.match(/\bstage:\s*([^\s]+)/i)?.[1] || '';
    const inputTokens = toNumber(line.match(/\binputTokens:\s*(\d+)/i)?.[1]);
    const outputTokens = toNumber(line.match(/\boutputTokens:\s*(\d+)/i)?.[1]);
    const cost = toNumber(line.match(/\bcost:\$?\s*([0-9.,]+)/i)?.[1]);
    const llmMs = parseDurationMs(line.match(/\bllmTime:\s*([0-9:.]+)/i)?.[1]);

    if (!provider && !model && !inputTokens && !outputTokens && !cost && !llmMs) return null;

    return {
        stepId: record.stepId,
        title: record.title,
        provider,
        model,
        alias,
        stage,
        inputTokens,
        outputTokens,
        cost,
        llmMs
    };
}

function parseLLMCallObject(record: TraceRecord): TaskLLMCall | null {
    const data = record.data;
    if (!data) return null;

    const inputTokens = toNumber(data.inputTokens);
    const outputTokens = toNumber(data.outputTokens);
    const cost = toNumber(data.cost);
    const llmMs = toNumber(data.llmMs || data.durationMs) || parseDurationMs(data.llmTime);
    const provider = String(data.provider || '');
    const model = String(data.model || '');

    if (!provider && !model && !inputTokens && !outputTokens && !cost && !llmMs) return null;

    return {
        stepId: record.stepId,
        title: record.title,
        provider,
        model,
        alias: String(data.alias || ''),
        stage: String(data.stage || ''),
        inputTokens,
        outputTokens,
        cost,
        llmMs
    };
}

function collectTraceDates(record: TraceRecord, starts: number[], finishes: number[]) {
    if (typeof record.data?.startedAt === 'string') {
        const ms = Date.parse(record.data.startedAt);
        if (Number.isFinite(ms)) starts.push(ms);
    }
    if (typeof record.data?.finishedAt === 'string') {
        const ms = Date.parse(record.data.finishedAt);
        if (Number.isFinite(ms)) finishes.push(ms);
    }

    for (const line of record.lines) {
        const start = line.match(/\bstarting at\s+([0-9TZ:.\-+]+)/i)?.[1];
        const finish = line.match(/\bfinished at\s+([0-9TZ:.\-+]+)/i)?.[1];
        if (start) {
            const ms = Date.parse(start);
            if (Number.isFinite(ms)) starts.push(ms);
        }
        if (finish) {
            const ms = Date.parse(finish);
            if (Number.isFinite(ms)) finishes.push(ms);
        }
    }
}

function compactTaskDateMs(taskId: string | undefined): number {
    const match = taskId?.match(/(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (!match) return 0;
    return Date.UTC(
        Number(match[1]),
        Number(match[2]) - 1,
        Number(match[3]),
        Number(match[4]),
        Number(match[5]),
        Number(match[6])
    );
}

function isErrorLine(line: string): boolean {
    return /\b(error|erro|failed|exception|timeout)\b/i.test(line);
}

function aggregateModels(calls: TaskLLMCall[]): TaskModelStatistic[] {
    const map = new Map<string, TaskModelStatistic>();
    for (const call of calls) {
        const key = `${call.provider || 'provider?'}|${call.model || 'model?'}|${call.alias || ''}|${call.stage || ''}`;
        const current = map.get(key) || {
            key,
            provider: call.provider || '-',
            model: call.model || call.alias || '-',
            alias: call.alias,
            stage: call.stage,
            calls: 0,
            inputTokens: 0,
            outputTokens: 0,
            cost: 0,
            llmMs: 0,
            tps: 0
        };
        current.calls += 1;
        current.inputTokens += call.inputTokens;
        current.outputTokens += call.outputTokens;
        current.cost += call.cost;
        current.llmMs += call.llmMs;
        map.set(key, current);
    }
    return [...map.values()]
        .map(model => ({
            ...model,
            tps: model.llmMs > 0 ? model.outputTokens / (model.llmMs / 1000) : 0
        }))
        .sort((a, b) => b.cost - a.cost || b.calls - a.calls);
}

export function buildTaskStatistics(task: mls.msg.TaskData | undefined): TaskExecutionStatistics {
    const steps = getAllSteps(task?.iaCompressed?.nextSteps as any) as any[];
    const byStatus: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const calls: TaskLLMCall[] = [];
    const errorLines: string[] = [];
    const starts: number[] = [];
    const finishes: number[] = [];
    let interactionCost = 0;
    let interactions = 0;
    let traceRecords = 0;
    let jsonTraceRecords = 0;
    let failedSteps = 0;

    for (const step of steps) {
        const status = String(step.status || 'unknown');
        const type = String(step.type || 'unknown');
        byStatus[status] = (byStatus[status] || 0) + 1;
        byType[type] = (byType[type] || 0) + 1;
        if (status === 'failed' || status.includes('error')) failedSteps += 1;

        if (!step.interaction) continue;
        const stepCost = toNumber(step.interaction.cost);
        if (stepCost <= 0) continue;
        interactions += 1;
        const callsBeforeInteraction = calls.length;
        interactionCost += stepCost;

        const traces = Array.isArray(step.interaction.trace) ? step.interaction.trace : [];
        for (const rawTrace of traces) {
            const record = parseTraceRecord(rawTrace, step);
            traceRecords += 1;
            if (record.isJson) jsonTraceRecords += 1;
            if (record.ok === false) errorLines.push(`${record.title || record.stepTitle}: ok=false`);

            collectTraceDates(record, starts, finishes);

            const parsedCalls = record.lines
                .map(line => parseLLMCallLine(line, record))
                .filter((call): call is TaskLLMCall => !!call);

            if (parsedCalls.length > 0) {
                calls.push(...parsedCalls);
            } else {
                const objectCall = parseLLMCallObject(record);
                if (objectCall) calls.push(objectCall);
            }

            for (const line of record.lines) {
                if (isErrorLine(line)) errorLines.push(line);
            }
        }

        if (calls.length === callsBeforeInteraction && stepCost > 0) {
            calls.push({
                stepId: Number(step.stepId || 0),
                title: String(step.stepTitle || step.agentName || step.toolName || step.type || ''),
                provider: '-',
                model: 'untraced interaction',
                alias: '',
                stage: 'interaction',
                inputTokens: 0,
                outputTokens: 0,
                cost: stepCost,
                llmMs: 0
            });
        }
    }

    const traceCost = calls.reduce((sum, call) => sum + call.cost, 0);
    const firstStart = starts.length > 0 ? Math.min(...starts) : compactTaskDateMs(task?.PK);
    const lastFinish = finishes.length > 0 ? Math.max(...finishes) : toNumber(task?.last_updated);

    return {
        totalSteps: steps.length,
        interactions,
        totalCost: traceCost > 0 ? traceCost : interactionCost,
        interactionCost,
        traceCost,
        llmCalls: calls.length,
        inputTokens: calls.reduce((sum, call) => sum + call.inputTokens, 0),
        outputTokens: calls.reduce((sum, call) => sum + call.outputTokens, 0),
        totalLlmMs: calls.reduce((sum, call) => sum + call.llmMs, 0),
        totalExecutionMs: firstStart && lastFinish && lastFinish > firstStart ? lastFinish - firstStart : 0,
        errorCount: failedSteps + errorLines.length,
        failedSteps,
        fallbackCount: calls.filter(call => call.stage.toLowerCase().includes('fallback')).length
            + errorLines.filter(line => line.toLowerCase().includes('fallback')).length,
        traceRecords,
        jsonTraceRecords,
        byStatus,
        byType,
        models: aggregateModels(calls),
        slowestCalls: [...calls].sort((a, b) => b.llmMs - a.llmMs).slice(0, 5),
        errorLines: errorLines.slice(0, 6)
    };
}

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
    private msg: MessageType = messages.en;

    @property() task: mls.msg.TaskData | undefined = undefined;
    @property() message: mls.msg.Message | undefined = undefined;
    @property() restartPooling: boolean = false;
    @property() isTest: boolean = false;

    @property() stepid: string = '';
    @property({ attribute: false }) seen = new Set<string>();

    @property() interactionClarification: mls.msg.AIAgentStep | undefined;
    @query('.direct-clarification') directClarification: HTMLElement | undefined;
    @query('.direct-clarification .content') directClarificationContent: HTMLElement | undefined;

    @state() private activeTab: TaskInfoTab = 'todo';
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

        const lang = this.getMessageKey(messages);
        this.msg = messages[lang];

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
                    <div
                        class="tab ${activeTab === 'statistics' ? 'active' : ''}"
                        @click=${() => this.setTab('statistics')}
                    >${this.msg.statistics}</div>
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

    renderTabContent(activeTab: TaskInfoTab) {
        switch (activeTab) {
            case 'workflow': return html`workflow`;
            case 'step': return this.renderStep();
            case 'statistics': return this.renderStatistics();
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

    renderStatistics() {
        const stats = buildTaskStatistics(this.task);
        const m = this.msg;
        const totalTokens = stats.inputTokens + stats.outputTokens;
        const tracePercent = stats.traceRecords > 0 ? Math.round((stats.jsonTraceRecords / stats.traceRecords) * 100) : 0;

        if (stats.totalSteps === 0 && stats.traceRecords === 0) {
            return html`<div class="stats-empty">${m.noStatistics}</div>`;
        }

        return html`
            <div class="stats-dashboard">
                <div class="stats-header">
                    <div>
                        <h3>${m.statisticsTitle}</h3>
                        <p>${m.statisticsSubtitle}</p>
                    </div>
                    <span class="stats-pill">${stats.totalSteps} ${m.total}</span>
                </div>

                <div class="stats-kpis">
                    ${this.renderStatKpi(m.totalCost, this.formatMoney(stats.totalCost), 'kpi-cost')}
                    ${this.renderStatKpi(m.llmCalls, this.formatInteger(stats.llmCalls), 'kpi-calls')}
                    ${this.renderStatKpi(m.totalTokens, this.formatInteger(totalTokens), 'kpi-tokens')}
                    ${this.renderStatKpi(m.executionTime, this.formatDuration(stats.totalExecutionMs), 'kpi-time')}
                    ${this.renderStatKpi(m.llmTime, this.formatDuration(stats.totalLlmMs), 'kpi-time')}
                    ${this.renderStatKpi(m.errorsFallbacks, `${stats.errorCount} / ${stats.fallbackCount}`, stats.errorCount > 0 ? 'kpi-error' : 'kpi-ok')}
                </div>

                <div class="stats-layout">
                    <section class="stats-panel stats-panel-wide">
                        <div class="stats-panel-title">${m.modelsUsed}</div>
                        ${this.renderModelsTable(stats)}
                    </section>

                    <section class="stats-panel">
                        <div class="stats-panel-title">${m.stepStatus}</div>
                        ${this.renderStatsBars(stats.byStatus)}
                    </section>

                    <section class="stats-panel">
                        <div class="stats-panel-title">${m.stepTypes}</div>
                        ${this.renderStatsBars(stats.byType)}
                    </section>

                    <section class="stats-panel">
                        <div class="stats-panel-title">${m.traceQuality}</div>
                        <div class="trace-quality">
                            <div class="trace-quality-value">${tracePercent}%</div>
                            <div class="trace-quality-bar">
                                <span style="width:${tracePercent}%"></span>
                            </div>
                            <p>${stats.jsonTraceRecords}/${stats.traceRecords} ${m.traceQualityValue}. ${m.traceQualityHelp}</p>
                        </div>
                    </section>

                    <section class="stats-panel">
                        <div class="stats-panel-title">${m.errorsTitle}</div>
                        <div class="stats-mini-grid">
                            <span><b>${stats.failedSteps}</b>${m.failedSteps}</span>
                            <span><b>${stats.fallbackCount}</b>${m.fallbacks}</span>
                        </div>
                        ${stats.errorLines.length > 0
                ? html`<ul class="stats-errors">${stats.errorLines.map(line => html`<li>${line}</li>`)}</ul>`
                : html`<div class="stats-ok">${m.noErrors}</div>`
            }
                    </section>

                    <section class="stats-panel stats-panel-wide">
                        <div class="stats-panel-title">${m.slowCalls}</div>
                        ${this.renderSlowCalls(stats)}
                    </section>
                </div>
            </div>
        `;
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
        if (nextStepPending?.type === 'clarification') return true;
        return !!getNextClarificationStep(this.task);
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


    private setTab(tab: TaskInfoTab) {
        if (tab === 'chat' && !this.canUseTaskRoom()) return;
        this.activeTab = tab;
    }

    private renderStatKpi(label: string, value: string, cssClass: string) {
        return html`
            <div class="stats-kpi ${cssClass}">
                <span class="stats-kpi-value">${value}</span>
                <span class="stats-kpi-label">${label}</span>
            </div>
        `;
    }

    private renderModelsTable(stats: TaskExecutionStatistics) {
        const m = this.msg;
        if (stats.models.length === 0) return html`<div class="stats-empty-inline">${m.noModels}</div>`;

        return html`
            <div class="stats-table">
                <div class="stats-table-row stats-table-head">
                    <span>${m.model}</span>
                    <span>${m.calls}</span>
                    <span>${m.inputTokens}</span>
                    <span>${m.outputTokens}</span>
                    <span>${m.tps}</span>
                    <span>${m.cost}</span>
                </div>
                ${stats.models.map(model => html`
                    <div class="stats-table-row">
                        <span class="model-name">
                            ${model.model}
                            ${model.alias ? html`<small>${model.alias}${model.stage ? `, ${model.stage}` : ''}</small>` : html``}
                        </span>
                        <span>${this.formatInteger(model.calls)}</span>
                        <span>${this.formatInteger(model.inputTokens)}</span>
                        <span>${this.formatInteger(model.outputTokens)}</span>
                        <span>${this.formatTps(model.tps)}</span>
                        <span>${this.formatMoney(model.cost)}</span>
                    </div>
                `)}
            </div>
        `;
    }

    private renderStatsBars(values: Record<string, number>) {
        const entries = Object.entries(values).sort((a, b) => b[1] - a[1]);
        const max = Math.max(1, ...entries.map(([, value]) => value));
        if (entries.length === 0) return html`<div class="stats-empty-inline">-</div>`;

        return html`
            <div class="stats-bars">
                ${entries.map(([label, value]) => html`
                    <div class="stats-bar-row">
                        <span class="stats-bar-label">${label}</span>
                        <span class="stats-bar-track">
                            <span class="stats-bar-fill" style="width:${Math.max(8, Math.round((value / max) * 100))}%"></span>
                        </span>
                        <span class="stats-bar-value">${value}</span>
                    </div>
                `)}
            </div>
        `;
    }

    private renderSlowCalls(stats: TaskExecutionStatistics) {
        if (stats.slowestCalls.length === 0) return html`<div class="stats-empty-inline">${this.msg.noModels}</div>`;
        return html`
            <div class="slow-calls">
                ${stats.slowestCalls.map(call => html`
                    <div class="slow-call">
                        <span>${call.title || call.model || `step ${call.stepId}`}</span>
                        <b>${this.formatDuration(call.llmMs)}</b>
                    </div>
                `)}
            </div>
        `;
    }

    private formatMoney(value: number) {
        const locale = this.getNumberLocale();
        const rounded = roundMoneyUpToCents(value);
        return `$ ${new Intl.NumberFormat(locale, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(rounded)}`;
    }

    private formatInteger(value: number) {
        return new Intl.NumberFormat(this.getNumberLocale()).format(Math.round(value));
    }

    private formatTps(value: number) {
        if (!value || !Number.isFinite(value)) return '0';
        return new Intl.NumberFormat(this.getNumberLocale(), { maximumFractionDigits: 1 }).format(value);
    }

    private getNumberLocale() {
        return document.documentElement.lang === 'pt' ? 'pt-BR' : 'en-US';
    }

    private formatDuration(ms: number) {
        if (!ms || ms < 0) return '00:00';
        const totalSeconds = Math.round(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
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
