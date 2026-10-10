/// <mls fileReference="_102025_/l2/collabMessagesHumanDmApi.ts" enhancement="_blank" />

import { post } from '/_102036_/l2/shared/api.js';
import type { RequestBase } from '/_102036_/l2/shared/interfaces.js';

export type HumanDmGroup = 'CRM' | 'TASK' | 'DOCS' | 'CONNECT' | 'APPS';

export type HumanDmOutcome = 'created' | 'existing';

export type HumanDmErrorCode =
	| 'not_found'
	| 'self'
	| 'schema'
	| 'not_human'
	| 'legacy_ambiguous'
	| 'archived'
	| 'pair_corrupt'
	| 'storage_unavailable'
	| 'contention_exhausted'
	| 'unknown_outcome'
	| 'incompatible';

export interface HumanDmThreadUser {
	userId: string;
}

/** Thread devolvida pelo backend; o cliente só aceita privada e ativa. */
export interface HumanDmThread {
	threadId: string;
	visibility: string;
	status: string;
	users: HumanDmThreadUser[];
}

export type EnsureHumanDmOk = {
	ok: true;
	outcome: HumanDmOutcome;
	thread: HumanDmThread;
};

export type EnsureHumanDmFail = {
	ok: false;
	code: HumanDmErrorCode;
	message: string;
};

export type EnsureHumanDmResult = EnsureHumanDmOk | EnsureHumanDmFail;

const ERROR_CODES = new Set<HumanDmErrorCode>([
	'not_found',
	'self',
	'schema',
	'not_human',
	'legacy_ambiguous',
	'archived',
	'pair_corrupt',
	'storage_unavailable',
	'contention_exhausted',
	'unknown_outcome',
	'incompatible',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null;
}

function textOf(reply: Record<string, unknown>): string {
	const msg = typeof reply.msg === 'string' ? reply.msg : '';
	const message = typeof reply.message === 'string' ? reply.message : '';
	return msg || message;
}

function isUnknownAction(text: string): boolean {
	return /unknown action|invalid action/i.test(text);
}

function asErrorCode(value: unknown): HumanDmErrorCode | undefined {
	return typeof value === 'string' && ERROR_CODES.has(value as HumanDmErrorCode)
		? value as HumanDmErrorCode
		: undefined;
}

function fail(code: HumanDmErrorCode, message: string): EnsureHumanDmFail {
	return { ok: false, code, message: message || code };
}

function pairMatches(users: unknown, userId: string, recipientUserId: string): users is HumanDmThreadUser[] {
	if (!Array.isArray(users) || users.length !== 2) return false;
	const ids = users.map((user) => (isRecord(user) && typeof user.userId === 'string' ? user.userId : ''));
	if (ids.some((id) => id === '')) return false;
	const expected = new Set([userId, recipientUserId]);
	return new Set(ids).size === 2 && ids.every((id) => expected.has(id));
}

/**
 * Aceita a resposta só com HTTP 200, outcome created|existing e thread privada,
 * ativa, com exatamente os dois participantes. O resto é falha, inclusive 200
 * com erro de domínio e action desconhecida no backend antigo.
 */
export function validateHumanDmReply(reply: unknown, userId: string, recipientUserId: string): EnsureHumanDmResult {
	if (!isRecord(reply)) {
		return fail('schema', 'invalid ensureHumanDm reply');
	}

	const text = textOf(reply);
	if (isUnknownAction(text)) {
		return fail('incompatible', text);
	}

	const statusCode = typeof reply.statusCode === 'number' ? reply.statusCode : undefined;
	const known = asErrorCode(reply.code);

	if (statusCode !== 200) {
		return fail(known && known !== 'incompatible' ? known : 'unknown_outcome', text);
	}

	const outcome = reply.outcome;
	if (outcome !== 'created' && outcome !== 'existing') {
		return fail(known ?? 'schema', text);
	}

	const thread = reply.thread;
	if (!isRecord(thread) || typeof thread.threadId !== 'string' || thread.threadId === '') {
		return fail('schema', text || 'thread missing');
	}
	if (thread.status !== 'active' || thread.visibility !== 'private' || !pairMatches(thread.users, userId, recipientUserId)) {
		return fail(known ?? 'schema', text || 'thread is not an active private pair');
	}

	return {
		ok: true,
		outcome,
		thread: thread as unknown as HumanDmThread,
	};
}

export async function msgEnsureHumanDm(args: {
	userId: string;
	recipientUserId: string;
	group: HumanDmGroup;
}): Promise<EnsureHumanDmResult> {
	try {
		const reply = await post<unknown>({
			action: 'ensureHumanDm',
			userId: args.userId,
			recipientUserId: args.recipientUserId,
			group: args.group,
		} as RequestBase & {
			userId: string;
			recipientUserId: string;
			group: HumanDmGroup;
		});
		return validateHumanDmReply(reply, args.userId, args.recipientUserId);
	} catch (error) {
		console.error('msgEnsureHumanDm', error);
		const message = error instanceof Error ? error.message : String(error);
		const statusCode = isRecord(error) && typeof error.statusCode === 'number' ? error.statusCode : undefined;
		return validateHumanDmReply({ statusCode, msg: message }, args.userId, args.recipientUserId);
	}
}
