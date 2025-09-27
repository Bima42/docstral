export interface ChatMessage {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
    isStreaming?: boolean;
    error?: string;
    sources?: SourceData[];
    metadata?: {
        tokensUsed?: number;
        latency?: number;
        model?: string;
    };
}

export interface ChatMetrics {
    totalMessages: number;
    totalTokensIn: number;
    totalTokensOut: number;
    averageLatency: number;
    estimatedCost: number;
    lastUpdated: Date;
}

export interface SourceData {
    title: string;
    url: string;
    score: number;
    chunk_id?: string;
}

//

export interface ChatRequest {
    messages: Array<{
        role: 'system' | 'user' | 'assistant';
        content: string;
    }>;
    // params: ChatParams;
}

export interface StreamEvent {
    type: 'token' | 'sources' | 'metrics' | 'done' | 'error';
    // data: any;
}

// export interface ChatParams {
//     temperature: number;
//     top_p: number;
//     rag: boolean;
// }