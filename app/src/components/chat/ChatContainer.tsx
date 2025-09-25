import React from 'react';
import { ChatInterface } from './ChatInterface.tsx';

/**
 * Main Chat Container Component
 *
 * Provides the main layout structure with main chat interface area
 */
export const ChatContainer: React.FC = () => {
	return (
		<div className="flex h-screen bg-surface-light dark:bg-surface-dark">
			<main className="flex-1 flex flex-col min-w-0">
				<ChatInterface />
			</main>
		</div>
	);
};
