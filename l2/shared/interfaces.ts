/// <mls fileReference="_102025_/l2/shared/interfaces.ts" enhancement="_blank"/>

export * from '/_102036_/l2/shared/interfaces.js';

declare module '/_102036_/l2/shared/interfaces.js' {
  export interface RequestUpdateMessage {
    pin?: boolean;
    favorite?: boolean;
  }

  export interface ResponseUpdateMessage {
    thread?: Thread;
    messages?: Message[];
    user?: User;
  }

  export interface User {
    favorites?: string[];
  }

  export interface Thread {
    pinnedMessages?: PinnedMessage[];
  }

  export interface PinnedMessage {
    messageId: string;
    pinnedBy: string;
    pinnedAt: string;
    excerpt?: string;
  }
}
