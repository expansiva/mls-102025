/// <mls fileReference="_102025_/l2/collabMessagesJohnSendError.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { isPersonalAgentDm, johnSendErrorMessage } from './collabMessagesJohnSendError.js';

void test('John send prerequisites are actionable in Portuguese and default English', () => {
  assert.equal(johnSendErrorMessage('DomainError: Select an organization for this session before messaging John.', 'pt'),
    'Selecione uma organização para esta sessão antes de enviar mensagem ao John.');
  assert.equal(johnSendErrorMessage('DomainError: The John test conversation is not prepared yet.', 'pt'),
    'A conversa de teste com John ainda não foi preparada.');
  assert.equal(johnSendErrorMessage('DomainError: The John test is not enabled or has expired.', 'pt'),
    'O teste com John não está habilitado ou expirou.');
  assert.equal(johnSendErrorMessage('DomainError: The John test conversation is not prepared yet.', 'es'),
    'The John test conversation is not prepared yet.');
  assert.equal(johnSendErrorMessage('Other error', 'pt'), 'Other error');
  assert.equal(johnSendErrorMessage('DomainError: Select an organization for this session before messaging Nora.', 'pt'),
    'Selecione uma organização para esta sessão antes de enviar mensagem à Nora.');
  assert.equal(johnSendErrorMessage('Error on cbePost, status: 500 - Error, error: assistant conversation was not created', 'en'),
    'Nora could not be opened. Try again.');
  assert.equal(johnSendErrorMessage('Error on cbePost, status: 403 - Forbidden, error: only your own conversation', 'pt'),
    'Você só pode abrir a sua conversa com a Nora.');
});

void test('personal agent binding accepts Nora and John without a written agent id', () => {
  const users = [{ userId: 'person' }, { userId: 'agent-user' }];
  const base = { visibility: 'private' as const, users };
  assert.equal(isPersonalAgentDm({ ...base, agentDm: { agentId: 'nora', agentUserId: 'agent-user' } }, 'person'), true);
  assert.equal(isPersonalAgentDm({ ...base, agentDm: { agentId: 'john', agentUserId: 'agent-user' } }, 'person'), true);
  assert.equal(isPersonalAgentDm({ ...base, agentDm: { agentId: 'nora', agentUserId: 'agent-user' } }, 'someone-else'), false);
  assert.equal(isPersonalAgentDm({ ...base, agentDm: { agentUserId: 'agent-user' } }, 'person'), false);
  assert.equal(isPersonalAgentDm({ visibility: 'private', users: [{ userId: 'person' }], agentDm: { agentId: 'nora', agentUserId: 'agent-user' } }, 'person'), false);
});
