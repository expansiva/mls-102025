/// <mls fileReference="_102025_/l2/requestMonacoLoad.ts" enhancement="_blank" />

const DEFAULT_TIMEOUT_MS = 20_000;

type Fire = (
    levels: mls.Level[] | mls.Level,
    types: mls.events.TypeEvent[] | mls.events.TypeEvent,
    desc?: string,
    timeout?: number,
) => Promise<void>;

/**
 * Ask the host to load Monaco. Does **not** create `window.monacoReady`.
 *
 * If the requester creates that promise first, the host
 * (`ensureMonacoReady` in 102041 / `loadMonacoScript` in 102033) sees it
 * already exists, never captures its resolver, and `script.onload` resolves
 * nothing — the tab hangs forever. Only the host creates and resolves it.
 *
 * `fire(..., 0)` delivers now (`await fireEvents`), so the listener has
 * already run when this returns. Then we await the host's promise.
 */
export async function requestMonacoLoad(
    mls: { events?: { fire?: Fire } },
    timeoutMs = DEFAULT_TIMEOUT_MS,
): Promise<void> {
    if (!mls?.events?.fire) {
        throw new Error('mls.events.fire unavailable');
    }
    await mls.events.fire(2, 'LoadMonaco', 'loadMonaco', 0);
    const ready = (globalThis as { window?: { monacoReady?: Promise<void> } }).window?.monacoReady;
    if (!ready) {
        throw new Error('no host listened for LoadMonaco');
    }
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
        await Promise.race([
            ready,
            new Promise<never>((_, reject) => {
                timer = setTimeout(() => reject(new Error('monacoReady timed out')), timeoutMs);
            }),
        ]);
    } finally {
        if (timer !== undefined) clearTimeout(timer);
    }
}
