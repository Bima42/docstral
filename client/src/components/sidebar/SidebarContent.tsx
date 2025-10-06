import { SidebarSection } from '@/components/sidebar/SidebarSection';
import { useChats } from '@/api/chat/queries';
import { useNavigate, useRouterState } from '@tanstack/react-router';
import { Route as ChatRoute } from '@/routes/chats/$chatId';
import { ChatsList, toRow } from '@/components/sidebar/SidebarChatsList';
import { useIsMobile } from '@/hooks/useMobile';
import { useSidebar } from '@/providers/SidebarProvider';

export const SidebarContent = ({ collapsed }: { collapsed: boolean }) => {
	const { data } = useChats();
	const { toggleCollapse } = useSidebar();
	const isMobile = useIsMobile();
	const rows = (data ?? []).map(toRow);

	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const activeId = pathname.match(/^\/chats\/([^/]+)/)?.[1];

	const onChatSelect = (id: string) => {
		navigate({ to: ChatRoute.to, params: { chatId: id } });
		if (isMobile) toggleCollapse();
	};

	if (collapsed) return null;

	return (
		<div className="flex flex-col flex-1 overflow-hidden">
			<div className="flex-1 overflow-y-auto">
				<div className="flex flex-col">
					<div>
						<SidebarSection>
							<ChatsList
								chats={rows}
								activeId={activeId}
								onSelect={onChatSelect}
							/>
						</SidebarSection>
					</div>
				</div>
			</div>
		</div>
	);
};