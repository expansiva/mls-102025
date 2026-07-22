/// <mls fileReference="_102025_/l2/testLlmClient.ts" enhancement="_blank"/>

// Live LLM test base (see skills/agentTest.md) — the round-trip half of agent step tests. Sends a forced
// tool call to collab-llm for a given modelType and reports whether the SCHEMA was rejected + the returned
// tool args. Every live agent step test imports this; never copy it into an agent.
//
// Browser-safe by design: it uses only `fetch` (no node:fs/path/process — mls-102025 has no @types/node).
// The single node-only bit — reading mls-base/.env from disk — stays in the `.test.ts` (which runs under
// node); it passes the file CONTENTS to `parseEnvFile` here, so all logic still lives in this base.

export interface CollabLlmConfig {
  baseUrl: string;
  token: string;
  org?: string;
}

export interface ToolProviderResult {
  modelType: string;
  status: number;
  text: string;
  args: unknown;          // the parsed tool_call `result`, or null
  schemaReject: boolean;  // true only when the provider rejected the SCHEMA DEFINITION (not args content)
}

// The single opt-in flag for live tests (agents never hardcode an env name — they call this).
export function liveTestsEnabled(): boolean {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  return env.AGENT_LIVE_TESTS === '1' || env.NS_LIVE_TESTS === '1';
}

// How many times each live case repeats. LLM content/tool-emission failures are INTERMITTENT (the model
// varies call-to-call — a required field dropped on one roll, a tool not emitted on another). A single
// call passes while production hits a bad roll, so live tests must repeat: fail if ANY run fails. Default
// 1 (fast); set AGENT_LIVE_RUNS=5 (or more) for a thorough pre-deploy sweep.
export function liveRuns(): number {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
  const n = Number(env.AGENT_LIVE_RUNS);
  return Number.isFinite(n) && n >= 1 ? Math.floor(n) : 1;
}

// Parse a .env file's CONTENTS (the test reads the file; this stays pure/browser-safe).
export function parseEnvFile(content: string): CollabLlmConfig {
  const env: Record<string, string> = {};
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim();
  }
  const baseUrl = (env.COLLAB_LLM_BASE_URL || '').replace(/\/+$/, '');
  const token = env.COLLAB_LLM_TOKEN || '';
  if (!baseUrl || !token) throw new Error('missing COLLAB_LLM_BASE_URL / COLLAB_LLM_TOKEN in .env');
  return { baseUrl, token, org: env.COLLAB_LLM_ORG_ID || 'collab' };
}

// Signatures of a schema-DEFINITION rejection (HTTP 400 before generation) vs an args-content failure.
const SCHEMA_DEF_SIGNS = /not a valid[^"]*schema|type is not defined|unresolvable \$ref|is not a "?uri-reference|invalid[_ ]request[^"]*schema/i;

// Send ONE call for a given modelType. Live step tests call this twice — once with 'code' (Grok), once with
// 'design' (Kimi) — for the same prompt. `modelType` is the marker value the runtime uses
// (`<!-- modelType: X -->`); collab-llm resolves it to a provider/model via `body.model`.
export async function callToolProvider(cfg: CollabLlmConfig, opts: {
  modelType: string;
  system: string;
  human: string;
  tool: unknown;            // a full { type:'function', function:{ name, parameters } }
  maxTokens?: number;
  timeoutMs?: number;
}): Promise<ToolProviderResult> {
  const toolName = (opts.tool as { function?: { name?: string } })?.function?.name;
  if (!toolName) throw new Error('callToolProvider: tool.function.name is missing');
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 120000);
  try {
    const res = await fetch(`${cfg.baseUrl}/v1/chat/completions`, {
      method: 'POST', signal: ctrl.signal,
      headers: {
        'Content-Type': 'application/json', 'Authorization': `Bearer ${cfg.token}`,
        'X-Org-Id': cfg.org ?? 'collab', 'X-Agent-Name': 'agentTest', 'x-tool-strict': 'true',
      },
      body: JSON.stringify({
        model: opts.modelType,
        messages: [{ role: 'system', content: opts.system }, { role: 'user', content: opts.human }],
        stream: false, temperature: 0, max_tokens: opts.maxTokens ?? 6000,
        tools: [opts.tool], tool_choice: { type: 'function', function: { name: toolName } },
      }),
    });
    const text = await res.text();
    return { modelType: opts.modelType, status: res.status, text, args: extractResultArgs(text), schemaReject: !res.ok && SCHEMA_DEF_SIGNS.test(text) };
  } finally {
    clearTimeout(timer);
  }
}

// Convenience: run the same prompt for both strict-tool modelTypes (code=Grok, design=Kimi).
export async function callBothModelTypes(cfg: CollabLlmConfig, opts: { system: string; human: string; tool: unknown; maxTokens?: number }): Promise<ToolProviderResult[]> {
  return Promise.all((['code', 'design'] as const).map(modelType => callToolProvider(cfg, { modelType, ...opts })));
}

function extractResultArgs(text: string): unknown {
  try {
    const call = (JSON.parse(text) as { choices?: Array<{ message?: { tool_calls?: Array<{ function?: { arguments?: unknown } }> } }> })
      ?.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
    const parsed = typeof call === 'string' ? JSON.parse(call) : call;
    return (parsed as { result?: unknown })?.result ?? null;
  } catch {
    return null;
  }
}
