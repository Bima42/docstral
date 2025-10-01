import { MOCK_MESSAGES, MOCK_METRICS } from '@/mocks/chats';
import type { ChatMessage, ChatMetrics } from '@/types/chat';
import { create } from 'zustand/react';

interface ChatState {
    messages: ChatMessage[];
    isLoading: boolean;
    error: string | null;
    metrics: ChatMetrics;
}

interface ChatStore extends ChatState {
    addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
    updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
    clearMessages: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    updateMetrics: (metrics: Partial<ChatMetrics>) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
	// Initial state
	messages: MOCK_MESSAGES,
	isLoading: false,
	error: null,
	metrics: MOCK_METRICS,

	// Actions
	addMessage: (messageData) => {
		const message: ChatMessage = {
			...messageData,
			id: crypto.randomUUID(),
			timestamp: new Date(),
		};

		set((state) => ({
			messages: [...state.messages, message],
			metrics: {
				...state.metrics,
				totalMessages: state.metrics.totalMessages + 1,
				lastUpdated: new Date()
			}
		}));
	},

	updateMessage: (id, updates) => {
		set((state) => ({
			messages: state.messages.map((msg) =>
				msg.id === id ? { ...msg, ...updates } : msg
			),
		}));
	},

	clearMessages: () => {
		set({
			messages: [],
			metrics: {
				...MOCK_METRICS,
				totalMessages: 0,
				totalTokensIn: 0,
				totalTokensOut: 0,
				lastUpdated: new Date()
			}
		});
	},

	setLoading: (loading) => set({ isLoading: loading }),

	setError: (error) => set({ error }),

	updateMetrics: (metricsUpdate) => {
		set((state) => ({
			metrics: {
				...state.metrics,
				...metricsUpdate,
				lastUpdated: new Date()
			}
		}));
	},
}));