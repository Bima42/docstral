import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarTrigger,
} from './ui/sidebar';
import { ThemeToggle } from './toggles/theme-toggle.tsx';
import { LanguageToggle } from './toggles/language-toggle.tsx';
import { User } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

const mockChats = [
    { id: 1, title: 'React Development', lastMessage: 'How to use hooks?' },
    { id: 2, title: 'TypeScript Tips', lastMessage: 'Type assertions vs...' },
    { id: 3, title: 'UI Components', lastMessage: 'Building a sidebar' },
    { id: 4, title: 'Performance Optimization', lastMessage: 'React.memo usage' },
    { id: 5, title: 'State Management', lastMessage: 'Zustand vs Redux' },
];

function UserHeader() {
    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                    <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                        <User className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-medium">Tanguy Pauvret</span>
                        <span className="truncate text-xs">Developer</span>
                    </div>
                    <SidebarTrigger className="-mr-1" />
                </SidebarMenuButton>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}

function ConversationsList() {
    return (
        <SidebarMenu>
            <div className="px-2 py-2 group-has-[[data-collapsible=icon]]/sidebar-wrapper:hidden">
                <h3 className="px-2 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">
                    Conversations
                </h3>
            </div>

            {mockChats.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                        tooltip={chat.title}
                        className="h-auto py-2"
                    >
                        <div className="grid px-2 flex-1 text-left text-sm leading-tight">
                            <span className="truncate font-medium">
                                {chat.title}
                            </span>
                            <span className="truncate text-xs text-sidebar-foreground/60">
                                {chat.lastMessage}
                            </span>
                        </div>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
    );
}

function SettingsFooter() {
    const { isDark } = useTheme();
    const { getLanguageDisplay } = useLanguage();

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground">
                    Language
                </span>
                <div className="flex items-center gap-2">
                    <LanguageToggle />
                </div>
            </div>

            <div className="flex items-center justify-between px-2 group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-medium text-sidebar-foreground">
                    Theme
                </span>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                </div>
            </div>

            <div className="hidden group-data-[collapsible=icon]:flex flex-col gap-2 items-center">
                <div className="p-1" title={`Language: ${getLanguageDisplay()}`}>
                    <LanguageToggle />
                </div>
                <div className="p-1" title={`Theme: ${isDark ? 'Dark' : 'Light'}`}>
                    <ThemeToggle />
                </div>
            </div>
        </div>
    );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    return (
        <Sidebar collapsible="icon" className="border-r-2 border-sidebar-border" {...props}>
            <SidebarHeader>
                <UserHeader />
            </SidebarHeader>

            <SidebarContent>
                <ConversationsList />
            </SidebarContent>

            <SidebarFooter>
                <SettingsFooter />
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
}