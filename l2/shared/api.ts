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

export async function post<T = msg.ResponseBase>(
	args: msg.RequestBase
): Promise<T> {
	let urlHttp = "https://on.collab.codes/exec";

	try {
		const response = await fetch(urlHttp, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(args),
			credentials: 'include'
		});

		if (response.status !== msg.HttpStatus.OK) {
			throw (await getPostError(response, args));
		}

		const data = await response.json();

		if (!data) {
			throw new Error("No data on cbePost");
		}

		return data as T;

	} catch (error) {
		console.info(error)
		throw error;
	}
}

export async function getPostError(response: Response, args: msg.RequestBase): Promise<Error> {
	const data = await response.json()
		.catch(err => {
			console.error("Error on getPostError: ", err);
			return new Error(`No data on cbePost error: ${err}`);
		});

	const errorMsg = (typeof data.msg === 'string') ? data.msg : data.error || 'Unknown error';
	if (response.status === msg.HttpStatus.BAD_REQUEST) {
		console.error(`Error on cbePost, status: ${response.status}, msg: ${errorMsg}, invalid args: `, JSON.stringify(args));
		return new Error(`Invalid args, msg: ${errorMsg}`);
	}
	if (response.status === msg.HttpStatus.CONFLICT) {
		return new Error(`DomainError: ${errorMsg}`);
	}
	const msg2 = `Error on cbePost, status: ${response.status} - ${response.statusText}, error: ${errorMsg}`;
	console.error(msg2);
	return new Error(msg2);
}

export async function msgGetUsers(
	args: Omit<msg.RequestGetUsers, "action">
): Promise<ApiResult<msg.ResponseGetUsers>> {

	return handleRequest<msg.ResponseGetUsers>(
		post<msg.ResponseGetUsers>({
			action: "getUsers",
			...args
		})
	);
}

export function msgGetUserUpdate(
	args: Omit<msg.RequestGetUserUpdate, "action">
) {
	return handleRequest<msg.ResponseGetUserUpdate>(
		post<msg.ResponseGetUserUpdate>({
			action: "getUserUpdate",
			...args
		})
	);
}

export function msgUpdateUserDetails(
	args: Omit<msg.RequestUpdateUserDetails, "action">
) {
	return handleRequest<msg.ResponseUpdateUserDetails>(
		post<msg.ResponseUpdateUserDetails>({
			action: "updateUserDetails",
			...args
		})
	);
}

export function msgAddThread(
	args: Omit<msg.RequestAddThread, "action">
) {
	return handleRequest<msg.ResponseAddThread>(
		post<msg.ResponseAddThread>({
			action: "addThread",
			...args
		})
	);
}

export function msgUpdateThread(
	args: Omit<msg.RequestUpdateThread, "action">
) {
	return handleRequest<msg.ResponseUpdateThread>(
		post<msg.ResponseUpdateThread>({
			action: "updateThread",
			...args
		})
	);
}

export function msgRemoveParticipantFromThread(
	args: Omit<msg.RequestRemoveUserInThread, "action">
) {
	return handleRequest<msg.ResponseRemoveUserInThread>(
		post<msg.ResponseRemoveUserInThread>({
			action: "removeUserInThread",
			...args
		})
	);
}

export function msgAddParticipantToThread(
	args: Omit<msg.RequestAddUserInThread, "action">
) {
	return handleRequest<msg.ResponseAddUserInThread>(
		post<msg.ResponseAddUserInThread>({
			action: "addUserInThread",
			...args
		})
	);
}

export function msgGetThreadUpdates(
	args: Omit<msg.RequestGetThreadUpdate, "action">
) {
	return handleRequest<msg.ResponseGetThreadUpdate>(
		post<msg.ResponseGetThreadUpdate>({
			action: "getThreadUpdate",
			...args
		})
	);
}

export function msgGetTaskUpdate(
	args: Omit<msg.RequestGetTaskUpdate, "action">
) {
	return handleRequest<msg.ResponseGetTaskUpdate>(
		post<msg.ResponseGetTaskUpdate>({
			action: "getTaskUpdate",
			...args
		})
	);
}

export function msgAddMessage(
	args: Omit<msg.RequestAddMessage, "action">
) {
	return handleRequest<msg.ResponseAddMessage>(
		post<msg.ResponseAddMessage>({
			action: "addMessage",
			...args
		})
	);
}

export function msgAddMessageAI(
	args: Omit<msg.RequestAddMessageAI, "action">
) {
	return handleRequest<msg.ResponseAddMessageAI>(
		post<msg.ResponseAddMessageAI>({
			action: "addMessageAI",
			...args
		})
	);
}

export function msgAddOrUpdateThreadBot(
	args: Omit<msg.RequestAddOrUpdateThreadBot, "action">
) {
	return handleRequest<msg.ResponseAddOrUpdateThreadBot>(
		post<msg.ResponseAddOrUpdateThreadBot>({
			action: "addOrUpdateThreadBot",
			...args
		})
	);
}

export function msgAddOrUpdateThreadIntegration(
	args: Omit<msg.RequestAddOrUpdateThreadIntegration, "action">
) {
	return handleRequest<msg.ResponseAddOrUpdateThreadIntegration>(
		post<msg.ResponseAddOrUpdateThreadIntegration>({
			action: "addOrUpdateThreadIntegration",
			...args
		})
	);
}

export function msgGetMessagesAfter(
	args: Omit<msg.RequestGetMessagesAfter, "action">
) {
	return handleRequest<msg.ResponseGetMessagesAfter>(
		post<msg.ResponseGetMessagesAfter>({
			action: "getMessagesAfter",
			...args
		})
	);
}

export function msgGetMessagesBefore(
	args: Omit<msg.RequestGetMessagesBefore, "action">
) {
	return handleRequest<msg.ResponseGetMessagesBefore>(
		post<msg.ResponseGetMessagesBefore>({
			action: "getMessagesBefore",
			...args
		})
	);
}

export function msgGetMessage(
	args: Omit<msg.RequestGetMessage, "action">
) {
	return handleRequest<msg.ResponseGetMessage>(
		post<msg.ResponseGetMessage>({
			action: "getMessage",
			...args
		})
	);
}

export function msgUpdateMessage(
	args: Omit<msg.RequestUpdateMessage, "action">
) {
	return handleRequest<msg.ResponseUpdateMessage>(
		post<msg.ResponseUpdateMessage>({
			action: "updateMessage",
			...args
		})
	);
}

export function msgAddOrUpdateOpenClawConnector(
	args: Omit<msg.RequestAddOrUpdateOpenClawConnector, "action">
) {
	return handleRequest<msg.ResponseAddOrUpdateOpenClawConnector>(
		post<msg.ResponseAddOrUpdateOpenClawConnector>({
			action: "addOrUpdateOpenClawConnector",
			...args
		})
	);
}

export function msgRemoveOpenClawConnector(
	args: Omit<msg.RequestRemoveOpenClawConnector, "action">
) {
	return handleRequest<msg.ResponseRemoveOpenClawConnector>(
		post<msg.ResponseRemoveOpenClawConnector>({
			action: "removeOpenClawConnector",
			...args
		})
	);
}

export function msgListOpenClawConnectors(
	args: Omit<msg.RequestListOpenClawConnectors, "action">
) {
	return handleRequest<msg.ResponseListOpenClawConnectors>(
		post<msg.ResponseListOpenClawConnectors>({
			action: "listOpenClawConnectors",
			...args
		})
	);
}

export function msgListOpenClawConnectorAgents(
	args: Omit<msg.RequestListOpenClawConnectors, "action">
) {
	return handleRequest<msg.ResponseListOpenClawConnectors>(
		post<msg.ResponseListOpenClawConnectors>({
			action: "listOpenClawConnectors",
			...args
		})
	);
}

export function msgListThreadOpenClawAgents(
	args: Omit<msg.RequestListThreadOpenClawAgents, "action">
) {
	return handleRequest<msg.ResponseListThreadOpenClawAgents>(
		post<msg.ResponseListThreadOpenClawAgents>({
			action: "listThreadOpenClawAgents",
			...args
		})
	);
}

export function msgAddOrUpdateThreadOpenClawAgent(
	args: Omit<msg.RequestAddOrUpdateThreadOpenClawAgent, "action">
) {
	return handleRequest<msg.ResponseAddOrUpdateThreadOpenClawAgent>(
		post<msg.ResponseAddOrUpdateThreadOpenClawAgent>({
			action: "addOrUpdateThreadOpenClawAgent",
			...args
		})
	);
}

export function msgRemoveThreadOpenClawAgent(
	args: Omit<msg.RequestRemoveThreadOpenClawAgent, "action">
) {
	return handleRequest<msg.ResponseRemoveThreadOpenClawAgent>(
		post<msg.ResponseRemoveThreadOpenClawAgent>({
			action: "removeThreadOpenClawAgent",
			...args
		})
	);
}

export function msgCreateOpenClawAgent (
	args: Omit<msg.RequestCreateOpenClawAgent , "action">
) {

	return handleRequest<msg.ResponseCreateOpenClawAgent >(
		post<msg.ResponseCreateOpenClawAgent >({
			action: "createOpenClawAgent",
			...args
		})
	);
}

export function msgDeleteOpenClawAgent   (
	args: Omit<msg.RequestDeleteOpenClawAgent , "action">
) {

	return handleRequest<msg.ResponseDeleteOpenClawAgent   >(
		post<msg.ResponseDeleteOpenClawAgent   >({
			action: "deleteOpenClawAgent",
			...args
		})
	);
}


export function msgListOpenClawAvailableAgents  (
	args: Omit<msg.RequestListOpenClawAvailableAgents  , "action">
) {
	return handleRequest<msg.ResponseListOpenClawAvailableAgents  >(
		post<msg.ResponseListOpenClawAvailableAgents  >({
			action: "listOpenClawAvailableAgents",
			...args
		})
	);
}


export type ApiResult<T> = {
	success: boolean;
	response?: T;
	error?: string;
	statusCode: number;
};