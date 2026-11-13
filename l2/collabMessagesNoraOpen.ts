/// <mls fileReference="_102025_/l2/collabMessagesNoraOpen.ts" enhancement="_blank" />

/** Screen address carried on a Nora message. Built by the cm, never by the model text. */
export type NoraMessageOpen = {
    page?: string;
    recordParam?: string;
    recordId?: string;
};

/** Same address as the human step: `page` or `page?recordParam=recordId`. No page, no button. */
export function noraMessageScreenAddress(open: NoraMessageOpen | undefined): string | undefined {
    const page = open?.page;
    if (!page) return undefined;
    if (!open?.recordParam) return page;
    return `${page}?${open.recordParam}=${encodeURIComponent(open.recordId ?? '')}`;
}
