/// <mls fileReference="_102025_/l2/shared/api.ts" enhancement="_blank"/>

import * as msg from '/_102025_/l2/shared/interfaces.js';

async function handleRequest<T>(promise: Promise<T & { statusCode: number; msg?: string }>): Promise<ApiResult<T>> {
	try {
		const res = await promise;

		if (res.statusCode >= 200 && res.statusCode < 300) {
			return {
				success: true,
				response: res,
				statusCode: res.statusCode
			};
		}

		return {
			success: false,
			error: res?.msg || 'Request failed',
			statusCode: res.statusCode
		};

	} catch (err: any) {
		return {
			success: false,
			error: err?.message || 'Unexpected error',
			statusCode: 500
		};
	}
}

export async function msgGetUsers(
	args: Omit<msg.RequestGetUsers, "action">
): Promise<ApiResult<msg.ResponseGetUsers>> {

	return handleRequest<msg.ResponseGetUsers>(
		mls.api.msgGetUsers(args)
	);
}

export function msgGetUserUpdate(
	args: Omit<msg.RequestGetUserUpdate, "action">
) {
	return handleRequest<msg.ResponseGetUserUpdate>(
		mls.api.msgGetUserUpdate(args)
	);
}

export function msgUpdateUserDetails(
	args: Omit<msg.RequestUpdateUserDetails, "action">
) {
	return handleRequest<msg.ResponseUpdateUserDetails>(
		mls.api.msgUpdateUserDetails(args)
	);
}

export function msgAddThread(
	args: Omit<msg.RequestAddThread, "action">
) {
	return handleRequest<msg.ResponseAddThread>(
		mls.api.msgAddThread(args)
	);
}

export async function msgUpdateThread(
	args: Omit<msg.RequestUpdateThread, "action">
): Promise<ApiResult<msg.ResponseUpdateThread>> {

	return handleRequest<msg.ResponseUpdateThread>(
		mls.api.msgUpdateThread(args)
	);
}

export function msgRemoveParticipantFromThread(
	args: Omit<msg.RequestRemoveUserInThread, "action">
) {
	const params: msg.RequestRemoveUserInThread = {
		action: 'removeUserInThread',
		...args
	};

	return handleRequest<msg.ResponseRemoveUserInThread>(
		mls.api.msgUpdateThread(params)
	);
}

export function msgAddParticipantToThread(args: Omit<msg.RequestAddUserInThread, "action">) {
	return handleRequest<msg.ResponseAddUserInThread>(
		mls.api.msgAddUserInThread(args)
	);
}

export function msgGetThreadUpdates(args: Omit<msg.RequestGetThreadUpdate, "action">) {
	return handleRequest<msg.ResponseGetThreadUpdate>(
		mls.api.msgGetThreadUpdate(args)
	);
}

export function msgGetTaskUpdate(
	args: Omit<msg.RequestGetTaskUpdate, "action">
) {
	return handleRequest<msg.ResponseGetTaskUpdate>(
		mls.api.msgGetTaskUpdate(args)
	);
}

export function msgAddMessage(
	args: Omit<msg.RequestAddMessage, "action">
) {
	return handleRequest<msg.ResponseAddMessage>(
		mls.api.msgAddMessage(args)
	);
}

export function msgAddOrUpdateThreadBot(
	args: Omit<msg.RequestAddOrUpdateThreadBot, "action">
) {
	return handleRequest<msg.ResponseAddOrUpdateThreadBot>(
		mls.api.msgAddOrUpdateThreadBot({
			...args,
		})
	);
}

export function msgAddOrUpdateThreadIntegration(
	args: Omit<msg.RequestAddOrUpdateThreadIntegration, "action">
) {
	return handleRequest<msg.ResponseAddOrUpdateThreadIntegration>(
		mls.api.msgAddOrUpdateThreadIntegration({
			...args
		})
	);
}

export function msgGetMessagesAfter(
	args: Omit<msg.RequestGetMessagesAfter, "action">
) {
	return handleRequest<msg.ResponseGetMessagesAfter>(
		mls.api.msgGetMessagesAfter(args)
	);
}

export function msgGetMessagesBefore(
	args: Omit<msg.RequestGetMessagesBefore, "action">
) {
	return handleRequest<msg.ResponseGetMessagesBefore>(
		mls.api.msgGetMessagesBefore(args)
	);
}

export function msgGetMessage(
	args: Omit<msg.RequestGetMessage, "action">
) {
	return handleRequest<msg.ResponseGetMessage>(
		mls.api.msgGetMessage(args)
	);
}

export function msgUpdateMessage(
	args: Omit<msg.RequestUpdateMessage, "action">
) {
	return handleRequest<msg.ResponseUpdateMessage>(
		mls.api.msgUpdateMessage({
			...args,
		})
	);
}


export function cbeAddOrUpdateOrgValue(
	key: string,
	value: string
) {
	return handleRequest<any>(
		mls.api.cbeAddOrUpdateOrgValue(key, value)
	);
}

export type ApiResult<T> = {
	success: boolean;
	response?: T;
	error?: string;
	statusCode: number;
};