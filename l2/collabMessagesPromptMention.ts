/// <mls fileReference="_102025_/l2/collabMessagesPromptMention.ts" enhancement="_blank" />

/** What the prompt needs of a user to suggest it after an `@`. */
export interface MentionUser {
    userId: string;
    name: string;
    avatar_url?: string | undefined;
}

/**
 * Who can be mentioned in a room: the people of the local copy that are in the room. The local copy keeps users of other times and other
 * rooms (a person of an old cm with the same name as one of the room), and a mention written with such an id is stored outside the room.
 * With no room (no `roomUserIds`) the list is whole, as before.
 */
export function mentionablePeople<T extends { userId: string }>(localUsers: readonly T[], roomUserIds: readonly string[] | undefined): T[] {
    if (!roomUserIds) return [...localUsers];
    const inRoom = new Set(roomUserIds);
    return localUsers.filter((user) => inRoom.has(user.userId));
}

export interface UserSuggestion {
    userId: string;
    name: string;
    avatar_url?: string | undefined;
    /** The user is a virtual employee that can be called: the list shows the mark. */
    callable: boolean;
}

/**
 * The list of an `@`: first the people of the conversation, then the virtual employees that can be called, each one once (a callable
 * that is already among the people is not repeated). The typed text filters both, by the start of the name, in any case.
 */
export function buildUserSuggestions(people: readonly MentionUser[], callable: readonly MentionUser[], query: string): UserSuggestion[] {
    const wanted = query.toLowerCase();
    const matches = (user: MentionUser) => user.name.toLowerCase().startsWith(wanted);
    const seen = new Set<string>();
    const result: UserSuggestion[] = [];
    for (const user of people) {
        if (!matches(user)) continue;
        seen.add(user.userId);
        result.push({ userId: user.userId, name: user.name, avatar_url: user.avatar_url, callable: false });
    }
    for (const user of callable) {
        if (seen.has(user.userId) || !matches(user)) continue;
        seen.add(user.userId);
        result.push({ userId: user.userId, name: user.name, avatar_url: user.avatar_url, callable: true });
    }
    return result;
}
