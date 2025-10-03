export type UUID = string;

export type UserOut = {
    id: UUID;
    name: string;
};

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM' | 'TOOL';

export type MessageOut = {
    id: UUID;
    chatId: UUID;
    role: MessageRole;
    content: string;
    createdAt: string;
};

export type MessageCreate = {
    content: string;
}

export type ChatOut = {
    id: UUID;
    userId: UUID;
    title: string;
    createdAt: string;
};

export type ChatDetail = ChatOut & {
    messages: MessageOut[];
};

export type ChatCreate = {
    title?: string;
}

export type StreamEvent =
    | { type: 'start' }
    | { type: 'token'; content: string }
    | { type: 'done' }
    | { type: 'error'; message: string };