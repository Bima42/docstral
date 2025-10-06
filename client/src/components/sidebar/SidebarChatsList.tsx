import { useLanguage } from '@/hooks/useLanguage.ts';
import { useDeleteChat, useUpdateChat } from '@/api/chat/queries.ts';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog.tsx';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover.tsx';
import type { ChatOut } from '@/api/client';
import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { MoreVertical } from 'lucide-react';

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

export function toRow(chat: ChatOut) {
	return {
		id: chat.id,
		title: chat.title,
		subtitle: formatRelative(chat.createdAt),
	};
}

type ChatRow = ReturnType<typeof toRow>;
type ChatActionsProps = {
    chatId: string;
    currentTitle: string;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onRename: (chatId: string, title: string) => void;
    onDelete: (chatId: string) => void;
};
const ChatActions = ({
	chatId,
	currentTitle,
	isOpen,
	onOpenChange,
	onRename,
	onDelete,
}: ChatActionsProps) => {
	const { t } = useLanguage();
    
	const handleRename = () => {
		onOpenChange(false);
		onRename(chatId, currentTitle);
	};

	const handleDelete = () => {
		onOpenChange(false);
		onDelete(chatId);
	};

	return (
		<Popover open={isOpen} onOpenChange={onOpenChange}>
			<PopoverTrigger asChild>
				<button
					type="button"
					onClick={(e) => e.stopPropagation()}
					className="p-1 rounded opacity-0 group-hover/item:opacity-100 transition-opacity hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 cursor-pointer"
					aria-label="Chat options"
				>
					<MoreVertical className="w-4 h-4 text-sidebar-foreground/60"/>
				</button>
			</PopoverTrigger>
			<PopoverContent
				className="w-40 p-1 border-none"
				align="end"
				side="right"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					type="button"
					onClick={handleRename}
					className="w-full px-3 py-2 text-left text-sm rounded hover:bg-sidebar-accent/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 cursor-pointer"
				>
					{t('common.rename')}
				</button>
				<button
					type="button"
					onClick={handleDelete}
					className="w-full px-3 py-2 text-left text-sm rounded text-red hover:bg-red-100 dark:hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 cursor-pointer"
				>
					{t('common.delete')}
				</button>
			</PopoverContent>
		</Popover>
	);
};
type ChatItemProps = {
    chat: ChatRow;
    isActive: boolean;
    isEditing: boolean;
    editValue: string;
    isPopoverOpen: boolean;
    onSelect: () => void;
    onEditChange: (value: string) => void;
    onEditSave: () => void;
    onEditCancel: () => void;
    onPopoverChange: (open: boolean) => void;
    onRename: (chatId: string, title: string) => void;
    onDelete: (chatId: string) => void;
};
const ChatItem = ({
	chat,
	isActive,
	isEditing,
	editValue,
	isPopoverOpen,
	onSelect,
	onEditChange,
	onEditSave,
	onEditCancel,
	onPopoverChange,
	onRename,
	onDelete,
}: ChatItemProps) => {
	return (
		<li>
			<div
				className={[
					'group/item flex w-full items-start gap-2 rounded-md px-2 py-2',
					'text-sidebar-foreground hover:bg-sidebar-accent/80',
					'transition-colors',
					isActive ? 'bg-sidebar-accent' : '',
				].join(' ')}
			>
				<button
					type="button"
					title={chat.title}
					onClick={() => !isEditing && onSelect()}
					className="flex-1 min-w-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring/50 rounded"
				>
					<div className="grid text-sm leading-tight px-1">
						{isEditing ? (
							<input
								type="text"
								value={editValue}
								onChange={(e) => onEditChange(e.target.value)}
								onBlur={onEditSave}
								onKeyDown={(e) => {
									if (e.key === 'Enter') onEditSave();
									if (e.key === 'Escape') onEditCancel();
								}}
								autoFocus
								className="w-full px-1 py-0.5 rounded bg-sidebar-accent border border-sidebar-border focus:outline-none focus:ring-2 focus:ring-sidebar-ring/50"
							/>
						) : (
							<span className="truncate font-medium">{chat.title}</span>
						)}
						<span className="truncate text-xs text-sidebar-foreground/60">
							{chat.subtitle}
						</span>
					</div>
				</button>

				<ChatActions
					chatId={chat.id}
					currentTitle={chat.title}
					isOpen={isPopoverOpen}
					onOpenChange={onPopoverChange}
					onRename={onRename}
					onDelete={onDelete}
				/>
			</div>
		</li>
	);
};


type ChatsListProps = {
    chats: ChatRow[];
    activeId?: string;
    onSelect?: (id: string) => void;
};
export const ChatsList = ({ chats, activeId, onSelect }: ChatsListProps) => {
	const { t } = useLanguage();
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValue, setEditValue] = useState('');
	const [deleteId, setDeleteId] = useState<string | null>(null);
	const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);

	const updateChat = useUpdateChat();
	const deleteChat = useDeleteChat();
	const navigate = useNavigate();

	const handleRename = (chatId: string, currentTitle: string) => {
		setEditingId(chatId);
		setEditValue(currentTitle);
	};

	const handleSaveRename = (chatId: string) => {
		const chat = chats.find((c) => c.id === chatId);
		if (editValue.trim() && editValue !== chat?.title) {
			updateChat.mutate({ chatId, title: editValue.trim() });
		}
		setEditingId(null);
		setEditValue('');
	};

	const handleCancelRename = () => {
		setEditingId(null);
		setEditValue('');
	};

	const handleDeleteClick = (chatId: string) => {
		setDeleteId(chatId);
	};

	const handleConfirmDelete = () => {
		if (!deleteId) return;
		deleteChat.mutate(deleteId);
		if (deleteId === activeId) {
			navigate({ to: '/chats' });
		}
		setDeleteId(null);
	};

	return (
		<>
			<ul className="flex flex-col gap-1 py-2 px-1">
				<h2 className="px-2 py-1 text-sm font-semibold text-sidebar-foreground/80">
					{t('chat.title')}
				</h2>
				{chats.map((chat) => (
					<ChatItem
						key={chat.id}
						chat={chat}
						isActive={chat.id === activeId}
						isEditing={editingId === chat.id}
						editValue={editValue}
						isPopoverOpen={openPopoverId === chat.id}
						onSelect={() => onSelect?.(chat.id)}
						onEditChange={setEditValue}
						onEditSave={() => handleSaveRename(chat.id)}
						onEditCancel={handleCancelRename}
						onPopoverChange={(open) => setOpenPopoverId(open ? chat.id : null)}
						onRename={handleRename}
						onDelete={handleDeleteClick}
					/>
				))}
			</ul>

			<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
				<AlertDialogContent
					className="text-neutral-900 dark:text-sidebar-foreground"
					onClick={(e) => e.stopPropagation()}>
					<AlertDialogHeader>
						<AlertDialogTitle>{t('chat.deleteDialog.title')}</AlertDialogTitle>
						<AlertDialogDescription>
							{t('chat.deleteDialog.description')}
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
						<AlertDialogAction
							onClick={handleConfirmDelete}
							className="cursor-pointer bg-red hover:bg-red-600 focus-visible:ring-red"
						>
							{t('common.delete')}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</>
	);
};