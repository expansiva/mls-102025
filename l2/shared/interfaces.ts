/// <mls fileReference="_102025_/l2/shared/interfaces.ts" enhancement="_blank"/>

export * from '/_102036_/l2/shared/interfaces.js';

declare module '/_102036_/l2/shared/interfaces.js' {
  export interface RequestUpdateMessage {
    pin?: boolean;
    favorite?: boolean;
    readConfirmation?: 'request' | 'confirm';
  }

  export interface ResponseUpdateMessage {
    thread?: Thread;
    messages?: Message[];
    user?: User;
    users?: User[];
  }

  export interface User {
    favorites?: string[];
    readConfirmations?: UserReadConfirmations;
  }

  export interface UserReadConfirmations {
    pending?: string[];
    requested?: string[];
  }

  export interface Message {
    readConfirmations?: MessageReadConfirmation[];
  }

  export interface MessageReadConfirmation {
    requestedBy: string;
    requestedAt: string;
    targetUserIds: string[];
    confirmedBy?: Record<string, string>;
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
