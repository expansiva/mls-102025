/// <mls fileReference="_102025_/l2/collabMessagesEnvironmentBase.ts" enhancement="_blank" />
// Neutral collab-messages environment: bots + getAgents/openclaw.
// No config (hosts have zero fields in common; contract spread is shallow).
// No notifications (owned by notificationsRuntime). No Studio imports.

import type { CollabMessagesEnvironment } from '/_102036_/l2/environmentContract.js';
import type { IAgentMeta, IOpenClawIntegration, Thread, ToolsBeforeSendMessage } from '/_102036_/l2/shared/interfaces.js';

export const collabMessagesEnvironmentBase: Pick<
    CollabMessagesEnvironment,
    'getAgents' | 'getIntegrationsOpenClaw' | 'setIntegrationsOpenClaw' | 'bots'
> = {
    getAgents,
    getIntegrationsOpenClaw,
    setIntegrationsOpenClaw: (integrations: IOpenClawIntegration[]) => setIntegrationsOpenClaw(integrations),
    bots: {
        getArgsToBots,
        getBotContextVarsBeforeMessageSend,
        getBotContextVarsBeforeMessageSend2
    },
};

async function getAgents(): Promise<IAgentMeta[]> {

    const keys = Object.keys(mls.stor.files);
    const ret: IAgentMeta[] = [];
    for await (const k of keys) {
        if (k.indexOf('agent') < 0) continue;
        const file = mls.stor.files[k];
        const path = `/_${file.project}_${file.folder ? file.folder + '/' : ''}${file.shortName}`;
        if (file.extension !== '.ts' || !file.shortName.startsWith('agent')) continue;
        try {
            const mdl = await import(path);
            if (!mdl.createAgent) continue;
            const agent = mdl.createAgent() as IAgentMeta
            ret.push(agent);
        } catch (err) {
            console.info(err)
            continue;
        }
    }
    return ret;

}

async function getIntegrationsOpenClaw(): Promise<IOpenClawIntegration[]> {

    if (mls.l5.actualOrg === undefined) return [];
    const actualOrgDetails = getOrgDetails(mls.l5.actualOrg);
    if (!actualOrgDetails || !actualOrgDetails.value) return [];
    try {
        const data = JSON.parse(actualOrgDetails.value);
        return data.integrations || []

    } catch (err: any) {
        throw new Error(err.message)
    }

}

async function setIntegrationsOpenClaw(integrations: IOpenClawIntegration[]): Promise<void> {

    if (mls.l5.actualOrg === undefined) throw new Error(`Invalid org actual: ${mls.l5.actualOrg}`);

    const actualOrgDetails = getOrgDetails(mls.l5.actualOrg);
    if (!actualOrgDetails) throw new Error(`Invalid org details: ${mls.l5.actualOrg}`);

    try {
        let data: any = {};

        if (actualOrgDetails.value) {
            data = JSON.parse(actualOrgDetails.value);
        }

        data = { ...data, integrations };

        await mls.api.cbeAddOrUpdateOrgValue(
            actualOrgDetails.sett.name,
            JSON.stringify(data)
        );

    } catch (err: any) {
        throw new Error(err.message);
    }

}

async function getArgsToBots(): Promise<Record<string, any>> {
    const data = {}
    return data;
}

async function getBotContextVarsBeforeMessageSend(thread: Thread, prompt: string): Promise<string[]> {
    return mls.bots.getBotContextVarsBeforeMessageSend(thread, prompt);
}

async function getBotContextVarsBeforeMessageSend2(vars: string[], myArgs: Record<string, any>): Promise<ToolsBeforeSendMessage[]> {
    return mls.bots.getBotContextVarsBeforeMessageSend2(vars, myArgs);
}

function getOrgDetails(orgIndex: number) {
    const actualOrgName = Object.keys(mls.stor.orgs)[orgIndex];
    const actualOrgDetails = mls.stor.orgs[actualOrgName];
    return actualOrgDetails;
}
