/// <mls fileReference="_102025_/l2/collabMessagesMomentsApi.ts" enhancement="_blank" />

import { post } from '/_102036_/l2/shared/api.js';
import type { Message, RequestBase, Thread } from '/_102036_/l2/shared/interfaces.js';

export interface MomentsPublisher {
	userId: string;
	name: string;
	avatar_url: string;
}

export interface MomentsFeedItem {
	threadId: string;
	publisher: MomentsPublisher;
	message: Message;
	seen: boolean;
	reach?: number;
}

export interface MomentsSeenItem {
	threadId: string;
	messageId: string;
}

export interface MomentsSubscriptionItem {
	threadId: string;
	publisher: MomentsPublisher;
	muted: boolean;
}

export interface MomentsStatsPost {
	messageId: string;
	createAt: string;
	preview: string;
	reach: number;
	reactions: number;
}

export interface RequestEnsureMomentsRoom extends RequestBase {
	action: 'ensureMomentsRoom';
	userId: string;
}

export interface ResponseEnsureMomentsRoom {
	statusCode: number;
	msg?: string;
	thread: Thread;
}

export interface RequestSetMomentsReaders extends RequestBase {
	action: 'setMomentsReaders';
	userId: string;
	add?: string[];
	remove?: string[];
}

export interface ResponseSetMomentsReaders {
	statusCode: number;
	msg?: string;
	thread: Thread;
}

export interface RequestGetMomentsFeed extends RequestBase {
	action: 'getMomentsFeed';
	userId: string;
	limit?: number;
}

export interface ResponseGetMomentsFeed {
	statusCode: number;
	msg?: string;
	items: MomentsFeedItem[];
}

export interface RequestMarkMomentSeen extends RequestBase {
	action: 'markMomentSeen';
	userId: string;
	items: MomentsSeenItem[];
}

export interface ResponseMarkMomentSeen {
	statusCode: number;
	msg?: string;
	ok: true;
}

export interface RequestSetMomentsMute extends RequestBase {
	action: 'setMomentsMute';
	userId: string;
	threadId: string;
	muted: boolean;
}

export interface ResponseSetMomentsMute {
	statusCode: number;
	msg?: string;
	ok: true;
}

export interface RequestGetMomentsSubscriptions extends RequestBase {
	action: 'getMomentsSubscriptions';
	userId: string;
}

export interface ResponseGetMomentsSubscriptions {
	statusCode: number;
	msg?: string;
	items: MomentsSubscriptionItem[];
}

export interface RequestGetMomentsStats extends RequestBase {
	action: 'getMomentsStats';
	userId: string;
	limit?: number;
}

export interface ResponseGetMomentsStats {
	statusCode: number;
	msg?: string;
	audience: number;
	posts: MomentsStatsPost[];
}

export type MomentsResult<T> = { ok: true; response: T } | { ok: false; error: string };

type MomentsBody = { statusCode?: number; msg?: string };

function errorText(value: unknown): string {
	if (typeof value === 'object' && value !== null) {
		const record = value as { msg?: unknown; message?: unknown };
		if (typeof record.msg === 'string' && record.msg) return record.msg;
		if (typeof record.message === 'string' && record.message) return record.message;
	}
	return 'Request failed';
}

async function call<T extends MomentsBody>(args: RequestBase): Promise<MomentsResult<T>> {
	try {
		const response = await post<T>(args);
		if (typeof response?.statusCode === 'number' && response.statusCode >= 400) {
			return { ok: false, error: response.msg || 'Request failed' };
		}
		return { ok: true, response };
	} catch (err) {
		console.error(err);
		return { ok: false, error: errorText(err) };
	}
}

export function msgEnsureMomentsRoom(args: Omit<RequestEnsureMomentsRoom, 'action'>) {
	return call<ResponseEnsureMomentsRoom>({ action: 'ensureMomentsRoom', ...args });
}

export function msgSetMomentsReaders(args: Omit<RequestSetMomentsReaders, 'action'>) {
	return call<ResponseSetMomentsReaders>({ action: 'setMomentsReaders', ...args });
}

export function msgGetMomentsFeed(args: Omit<RequestGetMomentsFeed, 'action'>) {
	return call<ResponseGetMomentsFeed>({ action: 'getMomentsFeed', ...args });
}

export function msgMarkMomentSeen(args: Omit<RequestMarkMomentSeen, 'action'>) {
	return call<ResponseMarkMomentSeen>({ action: 'markMomentSeen', ...args });
}

export function msgSetMomentsMute(args: Omit<RequestSetMomentsMute, 'action'>) {
	return call<ResponseSetMomentsMute>({ action: 'setMomentsMute', ...args });
}

export function msgGetMomentsSubscriptions(args: Omit<RequestGetMomentsSubscriptions, 'action'>) {
	return call<ResponseGetMomentsSubscriptions>({ action: 'getMomentsSubscriptions', ...args });
}

export function msgGetMomentsStats(args: Omit<RequestGetMomentsStats, 'action'>) {
	return call<ResponseGetMomentsStats>({ action: 'getMomentsStats', ...args });
}

/** Índice do primeiro item não visto; se todos vistos, o comprimento (card de fim). */
export function momentsStartIndex(items: Array<{ seen: boolean }>): number {
	const index = items.findIndex((item) => item.seen === false);
	return index === -1 ? items.length : index;
}
