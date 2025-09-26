import { SidebarSection } from '@/components/sidebar/SidebarSection.tsx';

type Conversation = {
    id: string;
    title: string;
    lastMessage: string;
};


const mockChats: Conversation[] = [
	{ id: '1', title: 'React Development', lastMessage: 'How to use hooks?' },
	{ id: '2', title: 'TypeScript Tips', lastMessage: 'Type assertions vs...' },
	{ id: '3', title: 'UI Components', lastMessage: 'Building a sidebar' },
	{ id: '4', title: 'Performance Optimization', lastMessage: 'React.memo usage' },
	{ id: '5', title: 'State Management', lastMessage: 'Zustand vs Redux' },
];

function ConversationsList({
	chats,
	activeId,
	onSelect
}: {
    chats: Conversation[];
    activeId?: string;
    onSelect?: (id: string) => void;
}) {
	return (
		<ul className="flex flex-col gap-1 p-1">
			{chats.map((chat) => {
				const isActive = chat.id === activeId;
				return (
					<li key={chat.id}>
						<button
							type="button"
							title={chat.title}
							onClick={() => onSelect?.(chat.id)}
							aria-current={isActive ? 'true' : undefined}
							className={[
								'flex w-full items-start gap-2 rounded-md px-2 py-2',
								'text-sidebar-foreground hover:bg-sidebar-accent/80',
								'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50',
								'transition-colors',
								isActive ? 'bg-sidebar-accent' : ''
							].join(' ')}
						>
							<div className="grid flex-1 min-w-0 text-left text-sm leading-tight px-1">
								<span className="truncate font-medium">
									{chat.title}
								</span>
								<span className="truncate text-xs text-sidebar-foreground/60">
									{chat.lastMessage}
								</span>
							</div>
						</button>
					</li>
				);
			})}
		</ul>
	);
}


export function SidebarContent({ collapsed }: { collapsed: boolean }) {
	if (collapsed) return null;

	return (
		<div className="flex flex-col flex-1 overflow-hidden">
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col p-3">
					<div>
						<SidebarSection>
							<ConversationsList
								chats={mockChats}
								activeId={mockChats[0]?.id}
								onSelect={(id) => {
									console.log('open conversation', id);
								}}
							/>
						</SidebarSection>
					</div>
				</div>
			</div>
		</div>
	);
}
