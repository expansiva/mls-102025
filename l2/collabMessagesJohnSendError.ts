/// <mls fileReference="_102025_/l2/collabMessagesJohnSendError.ts" enhancement="_blank" />

const errors = {
  'Select an organization for this session before messaging John.': {
    en: 'Select an organization for this session before messaging John.',
    pt: 'Selecione uma organização para esta sessão antes de enviar mensagem ao John.',
  },
  'Select an organization for this session before messaging Nora.': {
    en: 'Select an organization for this session before messaging Nora.',
    pt: 'Selecione uma organização para esta sessão antes de enviar mensagem à Nora.',
  },
  'The John test conversation is not prepared yet.': {
    en: 'The John test conversation is not prepared yet.',
    pt: 'A conversa de teste com John ainda não foi preparada.',
  },
  'The John test is not enabled or has expired.': {
    en: 'The John test is not enabled or has expired.',
    pt: 'O teste com John não está habilitado ou expirou.',
  },
  'only a signed-in caller can open their assistant conversation': {
    en: 'Sign in to open your conversation with Nora.',
    pt: 'Entre na conta para abrir sua conversa com a Nora.',
  },
  'missing caller': {
    en: 'Sign in to open your conversation with Nora.',
    pt: 'Entre na conta para abrir sua conversa com a Nora.',
  },
  'only your own conversation': {
    en: 'You can open only your own conversation with Nora.',
    pt: 'Você só pode abrir a sua conversa com a Nora.',
  },
  'User not found': {
    en: 'Your user was not found, so Nora could not be opened.',
    pt: 'Seu usuário não foi encontrado, então a Nora não abriu.',
  },
  'assistant conversation was not created': {
    en: 'Nora could not be opened. Try again.',
    pt: 'A Nora não abriu. Tente de novo.',
  },
} as const;

type KnownError = keyof typeof errors;

export interface PersonalAgentThread {
  visibility?: string;
  users: { userId: string }[];
  agentDm?: { agentId?: string; agentUserId?: string };
}

/** Private two-person thread whose agentDm binding names the other participant. */
export function isPersonalAgentDm(thread: PersonalAgentThread | undefined, userId: string | undefined): boolean {
  if (!userId || !thread) return false;
  const binding = thread.agentDm;
  if (!binding?.agentId || !binding.agentUserId) return false;
  return thread.visibility === 'private'
    && thread.users.length === 2
    && thread.users.some(item => item.userId === userId)
    && thread.users.some(item => item.userId === binding.agentUserId);
}

function knownError(error: string): KnownError | undefined {
  const stripped = error.replace(/^DomainError:\s*/, '');
  if (stripped in errors) return stripped as KnownError;
  const wrapped = error.match(/error:\s*(.+)$/);
  const inner = wrapped?.[1];
  if (inner && inner in errors) return inner as KnownError;
  return undefined;
}

export function johnSendErrorMessage(error: string, language: string): string {
  const key = knownError(error);
  if (!key) return error;
  return errors[key][language === 'pt' ? 'pt' : 'en'];
}
