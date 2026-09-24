/// <mls fileReference="_102025_/l2/collabMessagesJohnSendError.test.ts" enhancement="_blank" />

import test from 'node:test';
import assert from 'node:assert/strict';
import { johnSendErrorMessage } from './collabMessagesJohnSendError.js';

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
});
