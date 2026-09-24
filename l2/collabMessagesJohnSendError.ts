/// <mls fileReference="_102025_/l2/collabMessagesJohnSendError.ts" enhancement="_blank" />

const errors = {
  'Select an organization for this session before messaging John.': {
    en: 'Select an organization for this session before messaging John.',
    pt: 'Selecione uma organização para esta sessão antes de enviar mensagem ao John.',
  },
  'The John test conversation is not prepared yet.': {
    en: 'The John test conversation is not prepared yet.',
    pt: 'A conversa de teste com John ainda não foi preparada.',
  },
  'The John test is not enabled or has expired.': {
    en: 'The John test is not enabled or has expired.',
    pt: 'O teste com John não está habilitado ou expirou.',
  },
} as const;

export function johnSendErrorMessage(error: string, language: string): string {
  const message = error.replace(/^DomainError:\s*/, '');
  const translated = errors[message as keyof typeof errors];
  return translated ? translated[language === 'pt' ? 'pt' : 'en'] : error;
}
