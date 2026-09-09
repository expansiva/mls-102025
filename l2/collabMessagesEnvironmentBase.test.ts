/// <mls fileReference="_102025_/l2/collabMessagesEnvironmentBase.test.ts" enhancement="_blank" />

import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { environment, setEnvironment } from '/_102036_/l2/environmentContract.js';
import { collabMessagesEnvironmentBase } from '/_102025_/l2/collabMessagesEnvironmentBase.js';
import type { Thread } from '/_102036_/l2/shared/interfaces.js';

const source = readFileSync(
    join(dirname(fileURLToPath(import.meta.url)), 'collabMessagesEnvironmentBase.ts'),
    'utf8',
);

test('base has no Studio imports (the detector that would prove it was not neutral)', () => {
    assert.equal(
        (source.match(/_102027_/g) ?? []).length,
        0,
        'grep _102027_ must be empty',
    );
    assert.equal(
        (source.match(/\/l2\/aura\//g) ?? []).length,
        0,
        'grep /l2/aura/ must be empty',
    );
    assert.doesNotMatch(source, /\bconfig\s*:/);
    assert.doesNotMatch(source, /\bnotifications\s*:/);
});

test('studio-shaped spread keeps all 7 blocks and does not drop the base', async () => {
    type MlsHolder = {
        mls?: {
            stor?: { files?: Record<string, unknown> };
            bots?: {
                getBotContextVarsBeforeMessageSend?: (thread: Thread, prompt: string) => Promise<string[]>;
                getBotContextVarsBeforeMessageSend2?: (vars: string[], myArgs: Record<string, unknown>) => Promise<unknown[]>;
            };
        };
    };
    const holder = globalThis as MlsHolder;
    const previous = holder.mls;
    holder.mls = {
        ...(previous ?? {}),
        stor: { files: {} },
        bots: {
            getBotContextVarsBeforeMessageSend: async () => ['from-base'],
            getBotContextVarsBeforeMessageSend2: async () => [],
        },
    };
    setEnvironment({});
    try {
        setEnvironment({
            ...collabMessagesEnvironmentBase,
            notifications: {
                getPushSubscriptionForBackend: async () => null,
                getNotifySoundUrl: async () => 'sound',
                sendRequestMissed: async () => undefined,
                sendACK: async () => undefined,
            },
            agents: {
                loadAgent: async () => null,
            },
            tasks: {
                openTaskDetails: async () => ({ openLocal: true, element: undefined }),
            },
            apps: {
                getProgramMenu: async () => [],
            },
            config: {
                getMenuMode: () => 'custom',
                generateSvgAvatarEnabled: () => true,
            },
        });

        assert.deepEqual(await environment.getAgents(), []);
        assert.deepEqual(
            await environment.bots.getBotContextVarsBeforeMessageSend({} as Thread, ''),
            ['from-base'],
        );
        assert.equal(await environment.notifications.getNotifySoundUrl(), 'sound');
        assert.equal(await environment.agents.loadAgent('x'), null);
        assert.deepEqual(
            await environment.tasks.openTaskDetails('m', 't', {} as never, {} as never),
            { openLocal: true, element: undefined },
        );
        assert.deepEqual(await environment.apps.getProgramMenu(), []);
        assert.equal(environment.config.getMenuMode(), 'custom');
        assert.equal(environment.config.generateSvgAvatarEnabled(), true);
    } finally {
        setEnvironment({});
        if (previous === undefined) delete holder.mls;
        else holder.mls = previous;
    }
});
