/// <mls fileReference="_102025_/l2/toolSchemaLint.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import test from 'node:test';
import { lintToolSchema } from '/_102025_/l2/toolSchemaLint.js';

test('reports enum without type at the property path', () => {
    const errors = lintToolSchema(schema({
        properties: {
            status: { enum: ['ok', 'failed'] },
        },
    }));

    assertHasError(errors, '/properties/status', 'enum/const requires explicit type');
});

test('reports const without type at the property path', () => {
    const errors = lintToolSchema(schema({
        properties: {
            mediaType: { const: 'image' },
        },
    }));

    assertHasError(errors, '/properties/mediaType', 'enum/const requires explicit type');
});

test('reports raw dotted $id without scheme', () => {
    const errors = lintToolSchema(schema({
        $id: 'collab.codes/agentNewSolution/e5-operation/x',
    }));

    assertHasError(errors, '/', 'invalid $id "collab.codes/agentNewSolution/e5-operation/x"');
});

test('accepts absolute https $id', () => {
    const errors = lintToolSchema(schema({
        $id: 'https://collab.codes/agentNewSolution/e5-operation/x',
    }));

    assertNoError(errors, 'invalid $id');
});

test('reports root-relative $ref when $defs is nested under result', () => {
    const errors = lintToolSchema(schema({
        properties: {
            result: {
                type: 'object',
                additionalProperties: false,
                $defs: {
                    outputField: { type: 'string' },
                },
                properties: {
                    field: { $ref: '#/$defs/outputField' },
                },
            },
        },
    }));

    assertHasError(errors, '/properties/result/properties/field', 'unresolved $ref "#/$defs/outputField"');
});

test('accepts root-relative $ref when $defs is at parameters root', () => {
    const errors = lintToolSchema(schema({
        $defs: {
            outputField: { type: 'string' },
        },
        properties: {
            result: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    field: { $ref: '#/$defs/outputField' },
                },
            },
        },
    }));

    assertNoError(errors, 'unresolved $ref');
});

test('reports type union arrays', () => {
    const errors = lintToolSchema(schema({
        properties: {
            value: { type: ['boolean', 'string'] },
        },
    }));

    assertHasError(errors, '/properties/value', 'type union arrays are not strict-compatible');
});

test('reports object without additionalProperties false', () => {
    const errors = lintToolSchema(schema({
        properties: {
            result: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    }));

    assertHasError(errors, '/properties/result', 'object schema must declare additionalProperties: false');
});

test('reports additionalProperties true as an error', () => {
    const errors = lintToolSchema(schema({
        properties: {
            result: {
                type: 'object',
                additionalProperties: true,
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    }));

    assertHasError(errors, '/properties/result', 'additionalProperties must be false');
});

test('reports wrapper status enum without type', () => {
    const errors = lintToolSchema(schema({
        properties: {
            status: { enum: ['ok', 'failed'] },
            result: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    message: { type: 'string' },
                },
            },
        },
    }));

    assertHasError(errors, '/properties/status', 'enum/const requires explicit type');
});

test('returns null for a fully valid strict schema', () => {
    const errors = lintToolSchema(schema({
        $id: 'https://collab.codes/tool-schema',
        $defs: {
            outputField: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    name: { type: 'string' },
                    status: { type: 'string', enum: ['ok', 'failed'] },
                },
            },
        },
        properties: {
            status: { type: 'string', enum: ['ok', 'failed'] },
            kind: { type: 'string', const: 'image' },
            result: {
                type: 'object',
                additionalProperties: false,
                properties: {
                    field: { $ref: '#/$defs/outputField' },
                },
            },
        },
    }));

    assert.equal(errors, null);
});

test('returns invalid JSON error without throwing', () => {
    const errors = lintToolSchema('{');

    assert.ok(errors);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /^invalid JSON: /);
});

function schema(overrides: Record<string, unknown>): string {
    return JSON.stringify({
        type: 'object',
        additionalProperties: false,
        properties: {},
        ...overrides,
    });
}

function assertHasError(errors: string[] | null, path: string, text: string) {
    assert.ok(errors, `Expected error containing ${text}`);
    assert.ok(
        errors.some(error => error.includes(path) && error.includes(text)),
        `Expected ${JSON.stringify(errors)} to contain ${path} and ${text}`,
    );
}

function assertNoError(errors: string[] | null, text: string) {
    assert.ok(!errors?.some(error => error.includes(text)), `Unexpected ${text} in ${JSON.stringify(errors)}`);
}
