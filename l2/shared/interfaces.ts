/// <mls fileReference="_102025_/l2/shared/interfaces.ts" enhancement="_blank"/>

import type * as base from '/_102036_/l2/shared/interfaces.js';

export * from '/_102036_/l2/shared/interfaces.js';

export type MessageAttachmentKind = 'image' | 'video' | 'audio' | 'document' | 'file';
export type MessageAttachmentStatus = 'active' | 'deleted';

export interface MessageAttachment {
  attachmentId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  kind: MessageAttachmentKind;
  storageKey: string;
  uploadedBy: string;
  uploadedAt: string;
  status: MessageAttachmentStatus;
  deletedBy?: string;
  deletedAt?: string;
  url?: string;
}

export interface RequestCreateAttachmentUpload extends base.RequestBase {
  action: "createAttachmentUpload";
  userId: string;
  threadId: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface ResponseCreateAttachmentUpload extends base.ResponseBase {
  attachmentId: string;
  storageKey: string;
  uploadUrl: string;
  headers: Record<string, string>;
  expiresAt: string;
}

export interface AttachmentUploadCompletion {
  attachmentId: string;
  storageKey: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface RequestCompleteAttachmentUpload extends base.RequestBase {
  action: "completeAttachmentUpload";
  userId: string;
  threadId: string;
  content?: string;
  replyTo?: string;
  attachments: AttachmentUploadCompletion[];
}

export interface ResponseCompleteAttachmentUpload extends base.ResponseBase {
  message: base.Message;
}

export interface RequestDeleteAttachment extends base.RequestBase {
  action: "deleteAttachment";
  userId: string;
  threadId: string;
  messageId: string;
  attachmentId: string;
}

export interface ResponseDeleteAttachment extends base.ResponseBase {
  message: base.Message;
}

export interface RequestGetAttachmentUrl extends base.RequestBase {
  action: "getAttachmentUrl";
  userId: string;
  threadId: string;
  messageId: string;
  attachmentId: string;
}

export interface ResponseGetAttachmentUrl extends base.ResponseBase {
  url: string;
  expiresAt: string;
}

declare module '/_102036_/l2/shared/interfaces.js' {
  export interface RequestUpdateMessage {
    pin?: boolean;
    favorite?: boolean;
    readConfirmation?: 'request' | 'confirm' | 'cancel' | 'requestExecution' | 'reviewExecution';
    messageAction?: 'delete' | 'moderate' | 'createTask';
    editContent?: string;
    taskTitle?: string;
  }

  export interface ResponseUpdateMessage {
    thread?: Thread;
    messages?: Message[];
    user?: User;
    users?: User[];
    task?: TaskData;
    taskRoomThread?: Thread;
  }

  export interface RequestRemoveUserInThread {
    eventVisibility?: "all" | "admin";
  }

  export interface ResponseRemoveUserInThread {
    messages?: Message[];
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
    attachments?: MessageAttachment[];
    moderation?: MessageModeration;
    edits?: MessageEditVersion[];
    editedAt?: string;
    editedBy?: string;
  }

  export interface MessageModeration {
    status: "deleted" | "moderated";
    by: string;
    at: string;
  }

  export interface MessageEditVersion {
    content: string;
    editedBy: string;
    editedAt: string;
  }

  export interface MessageReadConfirmation {
    kind?: 'read' | 'execution';
    requestedBy: string;
    requestedAt: string;
    targetUserIds: string[];
    confirmedBy?: Record<string, string>;
    canceledAt?: string;
    canceledBy?: string;
    followupHistory?: MessageFollowupHistoryEntry[];
  }

  export interface MessageFollowupHistoryEntry {
    userId: string;
    reaction: string;
    at: string;
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
