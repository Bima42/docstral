import { SidebarSection } from '@/components/sidebar/SidebarSection';
import { useChats } from '@/api/chat/queries';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Route as ChatRoute } from '@/routes/chats/$chatId';
import type { ChatOut } from '@/api/client';

function formatRelative(iso: string) {
	const d = new Date(iso);
	const diff = Date.now() - d.getTime();
	const mins = Math.floor(diff / 60000);
	if (mins < 1) return 'Just now';
	if (mins < 60) return `${mins}m ago`;
	const hours = Math.floor(mins / 60);
	if (hours < 24) return `${hours}h ago`;
	const days = Math.floor(hours / 24);
	return `${days}d ago`;
}

function toRow(chat: ChatOut) {
	return {
		id: chat.id,
		title: chat.title,
		subtitle: formatRelative(chat.createdAt),
	};
}

interface ConversationsListProps {
    chats: ReturnType<typeof toRow>[];
    activeId?: string;
    onSelect?: (id: string) => void;
}

const ConversationsList = ({ chats, activeId, onSelect }: ConversationsListProps) => {
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
								isActive ? 'bg-sidebar-accent' : '',
							].join(' ')}
						>
							<div className="grid flex-1 min-w-0 text-left text-sm leading-tight px-1">
								<span className="truncate font-medium">{chat.title}</span>
								<span className="truncate text-xs text-sidebar-foreground/60">
									{chat.subtitle}
								</span>
							</div>
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {

	const { data } = useChats();
	const rows = (data ?? []).map(toRow);

	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const activeId = pathname.match(/^\/chats\/([^/]+)/)?.[1];
    
	if (collapsed) return null;

	return (
		<div className="flex flex-col flex-1 overflow-hidden">
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col">
					<div>
						<SidebarSection>
							<ConversationsList
								chats={rows}
								activeId={activeId}
								onSelect={(id) =>
									navigate({ to: ChatRoute.to, params: { chatId: id } })								}
							/>
						</SidebarSection>
					</div>
				</div>
			</div>
		</div>
	);
};