/// <mls fileReference="_102025_/l2/shared/interfaces.ts" enhancement="_blank"/>

export enum HttpStatus {
  OK = 200,
  NOT_MODIFIED = 304,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  NOT_FOUND = 404,
  FORBIDDEN = 403,
  CONFLICT = 409,
  SERVER_ERROR = 500,
  NOT_IMPLEMENTED = 501
}

export interface RequestBase {
  action: string;
}

export interface ResponseBase {
  statusCode: HttpStatus;
  msg?: string; // error message from 400 or 500 status code
}

export interface RequestAddMessage extends RequestBase {
  action: "addMessage";
  userId: string;
  threadId: string;
  content: string;
  contextToBot?: Record<string, any>;
  replyTo?: string; // use createAt of the message being replied to, obs. orderAt is not used for replyTo, because it can be changed when message is edited
}

export interface ResponseAddMessage extends ResponseBase {
  message: Message;
  botOutputs?: BotOutput[];
  integrationOutputs?: IntegrationOutput[];
}

export interface RequestUpdateMessage extends RequestBase {
  action: "updateMessage";
  userId: string; // owner of the thread
  threadId: string;
  messageId: string;
  reaction?: string; // emoji or text to add or update or remove from reactions, if the user already reacted with this reaction it will be removed, otherwise it will be added
}

export interface ResponseUpdateMessage extends ResponseBase {
  message: Message;
}

export interface RequestAddMessageAI extends RequestBase {
  action: "addMessageAI";
  userId: string;
  threadId: string;
  taskTitle: string;
  userMessage: string;
  agentName: string;
  inputAI: IAMessageInputType[];
  longTermMemory?: Record<string, string>; // long term memory
  replyTo?: string; // use createAt of the message being replied to, obs. orderAt is not used for replyTo, because it can be changed when message is edited
}

export interface ResponseAddMessageAI extends ResponseBase {
  message: Message;
  task: TaskData;
}

export interface RequestApplyIntents extends RequestBase {
  action: "applyIntents";
  userId: string;
  intents: AgentIntent[];
}

export interface ResponseApplyIntents extends ResponseBase {
  message?: Message;
  task: TaskData;
}

export interface RequestAddUser extends RequestBase {
  action: "addUser";
  name: string;
  avatar_url?: string;
}

export interface ResponseAddUser extends ResponseBase {
  user: User;
}

export interface RequestUpdateUserDetails extends RequestBase {
  action: "updateUserDetails";
  userId: string;
  name?: string;
  status?: "active" | "blocked" | "deleted";
  avatar_url?: string;
  deviceId: string; // device id for push notifications
  notificationToken?: string; // FCM token for push notifications
}

export interface ResponseUpdateUserDetails extends ResponseBase {
  user: User;
}

export interface RequestAddThread extends RequestBase {
  action: "addThread";
  userId: string;
  name: string;
  visibility: ThreadVisibility;
  status: ThreadStatus;
  group: ThreadGroup;
  languages: string[];
  avatar_url: string;
  defaultTopics?: string[];
  welcomeMessage?: string;
  // firsstMessage?: string;
}

export interface ResponseAddThread extends ResponseBase {
  thread: Thread;
}

export interface RequestDeleteThread extends RequestBase {
  action: "deleteThread";
  userId: string; // owner of the thread
  threadId: string;
}

export interface ResponseDeleteThread extends ResponseBase {
  thread: Thread;
}

export interface RequestUpdateThread extends RequestBase {
  action: "updateThread";
  userId: string; // owner of the thread
  threadId: string;
  newOwnerId?: string;
  name?: string;
  visibility?: ThreadVisibility;
  status?: ThreadStatus;
  group?: ThreadGroup;
  languages?: string[];
  avatar_url?: string;
  defaultTopics?: string[];
  welcomeMessage?: string;
}

export interface ResponseUpdateThread extends ResponseBase {
  thread: Thread;
}

export interface RequestGetTaskUpdate extends RequestBase {
  action: "getTaskUpdate";
  userId: string;
  messageId: string;
  taskId: string;
}

export interface ResponseGetTaskUpdate extends ResponseBase {
  task: TaskData;
}

export interface RequestAddTaskAISteps extends RequestBase {
  action: "addTaskAISteps";
  userId: string;
  messageId: string;
  taskId: string;
  parentStepId: number;
  stepdIdToChangeStatus: number | null;
  newStatus: AIStepStatus; // status to set in stepdIdToChangeStatus
  traceMsg: string | null;
  newTaskTitle: string;
  steps: AIPayload[];
}

export interface ResponseAddTaskAISteps extends ResponseBase {
  task: TaskData;
}

/**
 * add new prompts to a existing interaction,
 * change status of stepIdToChangeStatus to newStatus
 * change status of interactionStepId to 'in_progress'
 * start LLM
 */
export interface RequestAppendPromptToInteraction extends RequestBase {
  action: "appendPromptToInteraction";
  userId: string;
  messageId: string;
  taskId: string;
  interactionStepId: number; // stepId with child interaction
  inputAI: IAMessageInputType[];
  stepdIdToChangeStatus: number;
  newStatus: AIStepStatus; // status to set in stepdIdToChangeStatus
  traceMsg?: string; // optional trace message
}

export interface ResponseAppendPromptToInteraction extends ResponseBase {
  task: TaskData;
}

export interface RequestUpdateStepStatus extends RequestBase {
  action: "updateStepStatus";
  userId: string;
  messageId: string;
  taskId: string;
  stepId: number;
  status: AIStepStatus;
  traceMsg?: string; // optional trace message
  newTaskTitle?: string; // optional new task title to set
  newTaskStatus?: TaskStatus; // optional new task status to set
}

export interface ResponseUpdateStepStatus extends ResponseBase {
  task: TaskData;
  message?: Message; // optional message if task was updated with new status
}

export interface RequestAddTaskAIInteraction extends RequestBase {
  action: "addTaskAIInteraction";
  userId: string;
  messageId: string;
  taskId: string;
  parentStepId: number;
  inputAI: IAMessageInputType[]
}

export interface ResponseAddTaskAIInteraction extends ResponseBase {
  task: TaskData;
}

export interface RequestUpdateTaskTitle extends RequestBase {
  action: "updateTaskTitle";
  userId: string;
  messageId: string;
  taskId: string;
  newTitle: string;
}

export interface ResponseUpdateTaskTitle extends ResponseBase {
  task: TaskData;
}

export interface RequestGetMessagesAfter extends RequestBase {
  action: "getMessagesAfter";
  threadId: string;
  lastOrderAt: string;
  userId: string;
}

export interface ResponseGetMessagesAfter extends ResponseBase {
  data: Message[];
  hasMore: boolean;
}

export interface RequestGetMessagesBefore extends RequestBase {
  action: "getMessagesBefore";
  threadId: string;
  orderAt: string;
  userId: string;
}

export interface ResponseGetMessagesBefore extends ResponseBase {
  data: Message[];
  hasMore: boolean;
}

export interface RequestGetMessage extends RequestBase {
  action: "getMessage";
  threadId: string;
  messageId: string;
  userId: string;
}

export interface ResponseGetMessage extends ResponseBase {
  message: Message;
}

export interface RequestAddUserInThread extends RequestBase {
  action: "addUserInThread";
  userId: string; // userId from executor
  userIdOrName: string;
  threadId: string;
  auth: UserAuth;
}

export interface ResponseAddUserInThread extends ResponseBase {
  thread: Thread;
}

export interface RequestRemoveUserInThread extends RequestBase {
  action: "removeUserInThread";
  userId: string; // usersId from executor
  userIdOrName: string; // usersId for user to be removed
  threadId: string;
}

export interface ResponseRemoveUserInThread extends ResponseBase {
  thread: Thread;
}

export interface RequestGetThreadUpdate extends RequestBase {
  action: "getThreadUpdate";
  userId: string;
  threadId: string;
  deviceId?: string; // device id for push notifications
  lastOrderAt?: string; // optional, to get messages after this orderAt
}

export interface ResponseGetThreadUpdate extends ResponseBase {
  thread: Thread;
  users: User[];
  messages?: Message[]; // optional, if lastOrderAt is provided
  threadsPending: string[]; // threads that the user has to sync
  hasMore?: boolean;
}

export interface RequestGetUserUpdate extends RequestBase {
  action: "getUserUpdate";
  userId?: string;
  name?: string;
  avatar_url?: string;
}

export interface ResponseGetUserUpdate extends ResponseBase {
  user: User;
}

export interface RequestGetUsers extends RequestBase {
  action: "getUsers";
  userId: string;
  status: "active" | "blocked";
  prefixName: string;
}

export interface ResponseGetUsers extends ResponseBase {
  users: {
    userId: string; // compact UTC format `yyyyMMddHHmmss.nnn` unique sorted index, nnn is a sequence number
    name: string;
  }[]
}

export interface RequestAppendLongTermMemory extends RequestBase {
  action: "appendLongTermMemory";
  userId: string;
  messageId: string;
  taskId: string;
  longTermMemory: Record<string, string>; // long term memory
}

export interface ResponseAppendLongTermMemory extends ResponseBase {
  task: TaskData;
}

export interface RequestAddOrUpdateThreadBot extends RequestBase {
  action: "addOrUpdateThreadBot";
  userId: string; // userId from executor
  threadId: string;
  botId: string;                  // Unique ID for this bot in the thread, ex: "agentBotWeddingGifts"
  llmPrompt: string;              // prompt for this bot with {{ var }} variables
  status: "active" | "disabled";
  config?: Record<string, any>;  // Optional runtime config for the bot, sent to the LLM
}

export interface ResponseAddOrUpdateThreadBot extends ResponseBase {
  thread: Thread;
}

export interface BotFlexibleResultBase {
  ref?: string; // complementary key for bot memory, ex: "thread/.../bot/.../ref"
  output?: string; // string to return to user
  [key: string]: any; // additional properties
}

export interface BotOutput {
  botId: string;
  cost: number;
  output: string;
}

// ====================
// INTEGRATIONS
// ====================

export type IntegrationType = "openclaw"; // extensible: add "slack" | "teams" etc. in the future

export interface ThreadIntegration {
  integrationId: string;          // Unique ID for this integration in the thread
  type: IntegrationType;
  status: "active" | "disabled";
  config: ThreadIntegrationConfig;
  triggers: ThreadBotTrigger[];   // reuse existing trigger system
  lastExecutionAt?: string;       // compact UTC format
}

export interface ThreadIntegrationConfig {
  url: string;           // base URL of the external service, e.g. "http://openclaw-host:3000"
  bearerToken: string;   // Bearer token for outbound calls to the external service
  inboundToken: string;  // token the external service sends in x-integration-token header
  agentId?: string;      // optional: specific agent/assistant id on the external service
  sessionId?: string;    // optional: session id for conversation continuity
}

export interface IntegrationOutput {
  integrationId: string;
  type: IntegrationType;
  responseMessageId?: string; // orderAt of the response message posted back, if any
  error?: string;             // error message if execution failed
}

export interface RequestAddOrUpdateThreadIntegration extends RequestBase {
  action: "addOrUpdateThreadIntegration";
  userId: string;
  threadId: string;
  integrationId: string;
  type: IntegrationType;
  status: "active" | "disabled";
  config: ThreadIntegrationConfig;
  triggers: ThreadBotTrigger[];
}

export interface ResponseAddOrUpdateThreadIntegration extends ResponseBase {
  thread: Thread;
}

export interface RequestRemoveThreadIntegration extends RequestBase {
  action: "removeThreadIntegration";
  userId: string;
  threadId: string;
  integrationId: string;
}

export interface ResponseRemoveThreadIntegration extends ResponseBase {
  thread: Thread;
}

export interface RequestWebhookInbound {
  threadId: string;
  integrationId: string;
  content: string;
  type?: Message['type'];
  replyTo?: string;
}

export interface ResponseWebhookInbound extends ResponseBase {
  message: Message;
}


// ====================

export interface User {
  userId: string; // compact UTC format `yyyyMMddHHmmss.nnn` unique sorted index, nnn is a sequence number
  name: string;
  status: "active" | "blocked" | "deleted";
  avatar_url?: string;
  threads: string[];
  notifications?: UserNotifications[];
}
export interface UserNotifications {
  deviceId: string;
  notificationToken: string; // FCM token for push notifications
}


export interface UserPerformanceCache extends User {
  // ----
  // only on frontend
  //
  lastSync?: string; // compact UTC format `yyyyMMddHHmmss`
}


// ====================
// THREADS
// ====================


export type UserAuth = "admin" | "moderator" | "read" | "write" | "none";

export interface ThreadUsers {
  userId: string;
  auth: UserAuth;
}

export type ThreadGroup = "CRM" | "TASK" | "DOCS" | "CONNECT" | "APPS";
export type ThreadVisibility = "public" | "private" | "company" | "team"; // use private for only users in this thread
export type ThreadStatus = "active" | "archived" | "deleting" | "deleted";

export interface Thread {
  threadId: string; // compact UTC format `yyyyMMddHHmmss.nnn` unique sorted index, nnn is a sequence number
  name: string; // name of the thread (room)
  users: ThreadUsers[];
  visibility: ThreadVisibility;
  status: ThreadStatus;
  group: ThreadGroup;
  history: ThreadHistoryEntry[]; // history of actions in this thread
  languages: string[]; // iso 639-1 codes, example: ['en', 'pt', 'es']
  defaultTopics?: string[];
  welcomeMessage?: string;
  avatar_url: string;
  bots?: ThreadBot[];
  integrations?: ThreadIntegration[];
  archivedAt?: string; // compact UTC format `yyyyMMddHHmmss` when this thread was archived
  archivedBy?: string;
  deletedAt?: string; // compact UTC format `yyyyMMddHHmmss` when this thread was deleted
  createdAt: string; // compact UTC format `yyyyMMddHHmmss` when this thread was created
}

export interface ThreadHistoryEntry {
  action: string;
  userId: string;
  timestamp: string; // UTC format `yyyyMMddHHmmss`
}

export interface ThreadBot {
  botId: string;                  // Unique ID for this bot in the thread
  llmPrompt: string;              // prompt for this bot with {{ var }} variables
  threadFeature: ThreadFeature; // Feature this bot is associated with
  threadPermissionLevel: ThreadPermissionLevel; // Permission level for this bot
  triggers: ThreadBotTrigger[];
  status: "idle" | "running" | "disabled";
  lastExecutionAt?: string;      // UTC format
  memoryRef?: string;            // Reference to stored memory or context
  config?: Record<string, any>;  // Optional runtime config for the bot, sent to the LLM
}

export enum ThreadFeature {
  Summary = "summary",
  CustomPlugin = "custom_plugin",
  Tasks = "tasks",
  Workflow = "workflow",
  Notifications = "notifications",
  Voting = "voting",
  Moderation = "moderation",
  Feedback = "feedback"
}

export type ThreadPermissionLevel = "all" | "members" | "admin";

export interface ThreadBotTrigger {
  type: BotTriggerType;
  match?: "any" | "all"; // Optional: defines if all or any conditions are required (default: "any")
  conditions?: BotTriggerCondition[]; // Filters applied only for type "onNewMessage"
  args?: BotTriggerArgs; // Optional arguments depending on trigger type
}

export enum BotTriggerType {
  OnNewMessage = "onNewMessage",
  OnMention = "onMention",
  OnTaskCompleted = "onTaskCompleted",
  Schedule = "schedule",
  Manual = "manual"
}

export interface BotTriggerCondition {
  type: "hasTag" | "mention" | "startsWith" | "contains";
  value: string;
}

export type BotTriggerArgs =
  | { cron: string }                      // For type: "schedule", e.g. "0 18 * * 5"
  | { taskType: string }                 // For type: "onTaskCompleted"
  | Record<string, any>;                 // Generic fallback


export interface ThreadPerformanceCache extends Thread {
  // ----
  // only on frontend
  //
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  lastSync?: string; // compact UTC format `yyyyMMddHHmmss`
}


// ====================
// MESSAGES
// ====================


export interface Message {
  threadId: string;
  orderAt: string; // compact UTC format `yyyyMMddHHmmss.nnn` unique sorted index, nnn is a sequence number
  createAt: string; // compact UTC format `yyyyMMddHHmmss`
  updatedAt?: string; // compact UTC format `yyyyMMddHHmmss`
  senderId: string;
  content: string;
  language_detected?: string;
  externalPlatform?: string;
  translations?: Record<string, string>;
  reactions?: Record<string, string[]>; // key is reaction (emoji or text), value is array of userIds who reacted
  type?: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'; // default is `text`
  pin?: boolean;
  taskId?: string;

  taskTitle?: string; // title of the task, if this message is related to a task
  taskStatus?: TaskStatus; // status of the task, if this message is related to a task
  taskResults?: string[]; // resume of results of the task, if this message is related to a task
  taskResultsTranslated?: Record<string, string>; // translated results of the task, if this message is related to a task
  taskTitleTranslated?: Record<string, string>; // translated title of the task, if this message is related

  // updates?: object[];
  visibility?: "admin"; // only for admin, example: user left the thread
  url?: string;
  replyTo?: string; // use createAt of the message being replied to, obs. orderAt is not used for replyTo, because it can be changed when message is edited
}

export interface MessagePerformanceCache extends Message {
  // ----
  // only on frontend
  //
  lastSync?: string; // compact UTC format `yyyyMMddHHmmss`
  status?: 'read' | 'unread' | 'edited';
  footers: {
    title?: string;
    lines: string[];
    icon?: string; // icon to show in footer, ex: "fa fa-check"
    color?: string; // color of the footer, ex: "#00ff00"
    backgroundColor?: string; // background color of the footer, ex: "#000000"
    timestamp?: string;
  }[];
}

export interface ProviderConfig {
  provider: string;
  alternateProvider: string; // alternative provider to use if this is not available
  model: string;
  json: boolean; // accept json as output
  onlyImage?: boolean; // true if this model only generate images
  inputValue: number; // value for 1M tokens
  outputValue: number; // value for 1M tokens
  extrabody?: Record<string, string>;
}

export interface Providers {
  [provider: string]: Record<string, ProviderConfig>;
}

export type TaskOperationType = "create" | "read" | "update" | "delete" | "query";

export interface TaskOperation {
  operation: TaskOperationType;
  taskId?: string;
  data?: Partial<TaskData>;
  filters?: Record<string, any>;
  message?: string | null; // clarification message
}

export interface TaskData {
  PK: string; // Primary key, format: `task/#{taskId}`
  SK: 'metadata'; // Sort key of the composite primary key (legacy: “range key")
  title: string;
  owner: string; // who created this task, userId
  team: 'unassigned' | string | null; // team assigned to this task
  assigness?: string[]; // userIds assigned to this task
  status: TaskStatus;
  last_updated: 0 | number; // Date.now()
  last_update_log: string | null; // description of last update
  source?: string; // source of the task, ex: "user", "system", "api", default is "user"
  url?: string; // ? not used ever
  description?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  effort?: number; // estimated effort in hours
  cost?: number;
  iaCompressed?: IACompressed; // steps , prompts
  tags?: string[];
  attachmentsUrl?: string[]; // urls of attachments related to this task
  messageid_created?: string; // thread id and message id from origin this task. ex: 20250521144240.1000/20250706203939.1000
  messageid_refs?: string[]; // messages id referenced in this task
}

export type TaskStatus = 'todo' | 'in progress' | 'paused' | 'done' | 'failed';

export interface TaskDataToSave extends Omit<TaskData, 'iaCompressed'> {
  iaCompressed?: string;
}

//
// ====================
// AI TASKS
// ====================


export interface IACompressed {
  // this object can be compressed to a string for saving in DB
  nextSteps: AIPayload[];
  longMemory: Record<string, string>; // long term memory
  isTest?: boolean; // true if this is a test execution
  queueBackEnd: AgentIntent[]; // queue to be processed in backend
  queueFrontEnd: AgentHooks[]; // queue to be processed in frontend
}

export interface AIInteraction {
  input: IAMessageInputType[];
  cost: number; // cost in this interaction , with no deep cost
  trace: string[]; // optional trace of the steps
  payload: AIPayload[] | null; // Tree of steps or null for not processed
}

export interface IAMessageInputType {
  type: 'system' | 'human' | 'ai';
  content: string;
}

export type AIStepStatus =
  'waiting_human_input' | // for parallel steps waiting for human input
  'waiting_after_prompt' | // for parallel steps waiting for afterPrompt processing
  'pending' | // already created, waiting to be processed
  'in_progress' | // being processed in LLM
  'completed' | // completed successfully
  'failed'; // failed execution

export interface AIStepProgress {
  total: number;
  completed: number;
  failed: number;
  templateTitle: string; // ex: "preparing file {{completed}} of {{total}}, errors: {{failed}}"
}

export interface AIStep {
  type: AIPayload['type'];
  stepId: number; // unique id , from first interaction
  status: AIStepStatus;
  stepTitle?: string;
  progress?: AIStepProgress;
  // If null => interaction not prepared yet
  // If undefined => no LLM interaction needed for this step (e.g., tool call)
  // If defined => contains prompt/response used in this step
  interaction: AIInteraction | null | undefined;
  nextSteps: AIPayload[] | null; // Tree of steps or null for not processed or [] if no next steps
}

export type AIPayload = AIAgentStep | AIToolStep | AIClarificationStep | AIResultStep | AIFlexibleResultStep;

export interface AIAgentStep extends AIStep {
  type: 'agent';
  agentName: string;
  prompt?: string;
  rags: string[] | null; // name of files RAG to search
}

export interface AIToolStep extends AIStep {
  type: 'tool';
  toolName: string;
  args: string; // JSON stringified
}

export interface AIClarificationStep extends AIStep {
  type: 'clarification';
  json?: string;
}

export interface AIResultStep extends AIStep {
  type: 'result';
  result: string;
}

export interface AIFlexibleResultStep extends AIStep {
  type: 'flexible';
  result: any; // Flexible JSON result, parsed and handled by afterPrompt function
}

export interface ExecutionContext {
  message: Message;
  task: TaskData | undefined; // use undefined for start new task
  isTest: boolean; // true if this is a test execution
}

// ===================
// AGENT INTENTS
// commands from frontend to backend
// ===================

export type AgentIntentUpdateStatus = {
  type: 'update-status';
  messageId: string;
  threadId: string;
  taskId: string;
  hookSequential: number;
  parentStepId: number;
  stepId: number;
  status: AIStepStatus;
  cleaner?: 'input' | 'input_output'; // how to clean previous interactions in this step
}

export type AgentIntentAddStep = {
  type: 'add-step';
  messageId: string;
  threadId: string;
  taskId: string;
  parentStepId: number;
  step: AIPayload;
  stepTitle?: string;
  executionMode?: ExecutionMode;
}

export type AgentIntentPauseOrContinue = {
  type: 'pause-or-continue';
  messageId: string;
  threadId: string;
  taskId: string;
  reason: string
}

export type AgentIntentAddMessageAI = {
  type: 'add-message-ai';
  stepTitle?: string;
  request: Omit<RequestAddMessageAI, 'userId'>;
  executionMode?: ExecutionMode;
}

export type ExecutionMode = {
  type: 'parallel';
  args: string[];
  maxParallel?: number; // max parallel items to process, default = 5
};

/**
 * Parallel steps execution mechanism.
 * Child steps inherit the system prompt from their parent step.
 * Human prompts are prepared client-side using compact args (via beforePrompt hook).
 * Keep args short, unique, and deterministic.
 *
 * Parallel execution flow:
 *
 * 1. Frontend requests creation of a parent step (via API) with system prompt only
 *    and one or more AgentIntentParallelSteps.
 *
 * 1.1 Frontend enforces max parallel items per request.
 *     Use pagination (offset/limit or batch markers) in args when more items exist.
 *
 * 2. Backend:
 *    - Creates parent step with status "in_progress"
 *    - Enqueues AgentIntentParallelSteps in queueBackEnd
 *    - Immediately creates a batch of "waiting_human_input" child steps (no human prompt yet)
 *
 * 2.1 Parent remains "in_progress" until all children reach terminal state ("completed" or "failed").
 *
 * 2.2 Child steps are pre-allocated and reused as prompts arrive.
 *
 * 3. Backend enqueues multiple AgentHookBeforePrompt (one per waiting_human_input child) for frontend.
 *
 * 4. Frontend prepares human prompts and returns AgentIntentContinueParallelStep items.
 *
 * 5. Backend:
 *    - Updates child steps with received human prompts
 *    - Applies strong deduplication (ignore duplicates by parentStepId + args)
 *    - Cleans queueBackEnd and queueFrontEnd
 *
 * 6. Backend executes child steps as they become ready.
 *
 * 6.1 After each child execution, backend sends feedback AgentHook to frontend
 *     (success or error). Frontend then requests child status update to "completed" or "failed".
 *
 * 7. When ALL children are in terminal state, backend finalizes the parent step.
 *
 * 7.1 Finished child steps are deleted to reduce task object size.
 *
 * Critical implementation notes:
 * - Uniqueness key: parentStepId + args (must be collision-resistant)
 * - Step 5 MUST implement strict idempotency and duplicate rejection
 * - Error handling, child retries, and stuck-state timeouts are responsibility of other system layers
 */
export type AgentIntentParallelSteps = {
  type: 'parallel-steps';
  parentStepId: number; // parentStepId + args must be unique to identify this parallel execution
  args: string;         // compact args to identify unique step arguments
};

export type AgentIntentPromptReady = {
  type: 'prompt_ready';
  messageId: string;
  threadId: string;
  taskId: string;
  hookSequential: number; // unique sequential id of the corresponding AgentHookBeforePrompt
  parentStepId: number;
  args: string;           // original args (for validation/deduplication)
  humanPrompt: string;    // prepared human prompt ready for execution
  systemPrompt?: string;  // optional updated system prompt for this step
};

export type AgentIntentRemoveHook = {
  type: 'remove-hook';
  messageId: string;
  threadId: string;
  taskId: string;
  hookSequential: number;
};

export type AgentIntent = AgentIntentAddStep | AgentIntentPauseOrContinue | AgentIntentUpdateStatus | AgentIntentParallelSteps | AgentIntentPromptReady | AgentIntentAddMessageAI | AgentIntentRemoveHook;

// ===================
// AGENT HOOKS
// functions to be executed in frontend
// ===================

export type AgentHookBase = {
  hookSequential: number; // unique sequential id to order hooks
  stepId: number,
}

export type AgentHookBeforePromptStep = AgentHookBase & {
  type: 'beforePromptStep', // prepare new prompt after agent or tool step or parallel step
  parentStepId: number,
  args: string,
}

export type AgentHookBeforeTool = AgentHookBase & {
  type: 'beforeTool', // prepare new prompt after agent or tool step or parallel step
  parentStepId: number,
  args: string,
}

export type AgentHookAfterPromptStep = AgentHookBase & {
  type: 'afterPromptStep' // after human prompt step is added
  parentStepId: number,
}

export type AgentHookPooling = AgentHookBase & {
  type: 'pooling' // pooling to check for updates
  executionCount: number; // number of times this pooling has been executed
  afterMs: number; // milliseconds to wait before next pooling
}

export type AgentHooks = AgentHookBeforePromptStep | AgentHookAfterPromptStep | AgentHookPooling | AgentHookBeforeTool;
