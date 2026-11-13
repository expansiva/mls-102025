/// <mls fileReference="_102025_/l2/collabMessagesTaskPreviewModuleTrace.test.ts" enhancement="_blank"/>

import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import ts from 'typescript';

type Label = (
    executor: mls.msg.TaskModuleExecutor,
    via: 'nora' | undefined,
    t: { person: string; routine: string; byNora: string },
) => string;

async function loadLabel(): Promise<Label> {
    const source = readFileSync(new URL('./collabMessagesTaskPreview.ts', import.meta.url), 'utf8');
    const start = source.indexOf('export function moduleTraceExecutorLabel(');
    const end = source.indexOf("@customElement('collab-messages-task-preview-102025')");
    assert.ok(start > 0 && end > start, 'moduleTraceExecutorLabel not found');
    const js = ts.transpileModule(source.slice(start, end), {
        compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 },
    }).outputText;
    const file = join(mkdtempSync(join(tmpdir(), 'module-trace-')), 'label.mjs');
    writeFileSync(file, js);
    const mod = await import(pathToFileURL(file).href) as { moduleTraceExecutorLabel: Label };
    return mod.moduleTraceExecutorLabel;
}

const pt = { person: 'Pessoa', routine: 'Rotina', byNora: 'pela Nora' };

describe('module history via Nora', { concurrency: 1 }, () => {
    test('person line with the mark ends with pela Nora', async () => {
        const label = await loadLabel();
        const text = label({ kind: 'person', userId: 'ana' }, 'nora', pt);
        assert.equal(text, 'Pessoa: ana pela Nora');
    });

    test('person line without the mark stays as today', async () => {
        const label = await loadLabel();
        const text = label({ kind: 'person', userId: 'ana' }, undefined, pt);
        assert.equal(text, 'Pessoa: ana');
    });

    test('routine line ignores a mark', async () => {
        const label = await loadLabel();
        const text = label({ kind: 'routine', name: 'nightly' }, 'nora', pt);
        assert.equal(text, 'Rotina: nightly');
    });
});
