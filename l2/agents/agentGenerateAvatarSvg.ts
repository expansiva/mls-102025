/// <mls shortName="agentGenerateAvatarSvg" project="102025" enhancement="_blank" folder="agents" />

import { IAgent, svg_agent } from '/_100554_/aiAgentBase';
import { getPromptByHtml } from '/_100554_/aiPrompts';
import {
    getAgentStepByAgentName,
    getNextInProgressStepByAgentName,
    updateStepStatus,
    updateTaskTitle,
} from "/_100554_/aiAgentHelper";

import { startNewAiTask, executeNextStep } from "/_100554_/aiAgentOrchestration";

const agentName = "agentGenerateAvatarSvg";

export function createAgent(): IAgent {
    return {
        agentName,
        avatar_url: svg_agent,
        agentDescription: "Responsavel por criar svg avatar",
        visibility: "private",
        scope: [],
        async beforePrompt(context: mls.msg.ExecutionContext): Promise<void> {
            return _beforePrompt(context);
        },
        async afterPrompt(context: mls.msg.ExecutionContext): Promise<void> {
            return _afterPrompt(context);
        },
    }
};

const _beforePrompt = async (context: mls.msg.ExecutionContext): Promise<void> => {

    const taskTitle = "Creating";
    if (!context || !context.message) throw new Error("Invalid context");
    if (!context.task) {
        const inputs = await getPrompts(context.message.content);
        await startNewAiTask(
            agentName,
            taskTitle,
            context.message.content,
            context.message.threadId,
            context.message.senderId,
            inputs,
            context,
            _afterPrompt
        ).catch((err) => {
            throw new Error(err.message)
        });
    }
}

const _afterPrompt = async (context: mls.msg.ExecutionContext): Promise<void> => {
    if (!context || !context.message || !context.task) throw new Error("Invalid context");
    const step: mls.msg.AIAgentStep | null = getNextInProgressStepByAgentName(context.task, agentName);
    if (!step) throw new Error(`[${agentName}] afterPrompt: No pending interaction found.`);
    context = await updateStepStatus(context, step.stepId, "completed");
    if (!context.task) throw new Error("Invalid context task");
    context.task = await updateTaskTitle(context.task, "Svg created");
    await executeNextStep(context);
}


async function getPrompts(data: string): Promise<mls.msg.IAMessageInputType[]> {
    const dataPrompt = {
        userPrompt: JSON.stringify(data)
    };
    const rc = await getPromptByHtml({ folder: 'agents', project: 102025, shortName: agentName, data: dataPrompt });
    return rc;
}

export function getPayload(context: mls.msg.ExecutionContext): string {
    if (!context || !context.task) throw new Error(`[${agentName}] [getPayload] Invalid context`);
    const agentStep = getAgentStepByAgentName(context.task, agentName); // Only one agent execution must exist in this task
    if (!agentStep) throw new Error(`[${agentName}] [getPayload] no agent found`);
    const resultStep = agentStep.interaction?.payload?.[0];
    if (!resultStep || resultStep.type !== "flexible" || !resultStep.result) throw new Error(`[${agentName}] [getPayload] No step flexible found for this agent.`);
    let payload3: string | string = resultStep.result;
    return payload3;
}

