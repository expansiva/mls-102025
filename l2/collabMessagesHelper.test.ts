/// <mls fileReference="_102025_/l2/collabMessagesHelper.test.ts" enhancement="_blank"/>

import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const source = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'collabMessagesHelper.ts'), 'utf8');

test('collabMessagesHelper has no local getMessageKey and imports it from libCommom', () => {
    const localCopy = ['function', 'getMessageKey'].join(' ');
    assert.equal(source.includes(localCopy), false, 'local getMessageKey copy must be gone');
    assert.match(
        source,
        /import\s*\{\s*getMessageKey\s*\}\s*from\s*['"]\/_102029_\/l2\/libCommom\.js['"]/,
        'must import getMessageKey from /_102029_/l2/libCommom.js',
    );
    assert.match(source, /\bconst lang = getMessageKey\(messages\)/, 'top-level call must remain');
});

test('registerToken sends subscription and stores endpoint as local identity', () => {
    assert.match(source, /environment\.notifications\.getPushSubscriptionForBackend\(\)/);
    assert.doesNotMatch(source, /getFCMTokenForBackend/);
    assert.doesNotMatch(source, /notificationToken/);
    assert.match(source, /saveNotificationToken\(subscription\.endpoint\)/);
    assert.match(source, /lastToken === subscription\.endpoint/);
    assert.match(
        source,
        /msgUpdateUserDetails\(\{[\s\S]*?\bsubscription\b[\s\S]*?\}\)/,
        'msgUpdateUserDetails must send subscription, not notificationToken',
    );
});
