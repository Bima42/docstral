import { useTheme } from '@/hooks/useTheme.ts';
import { Toggle } from "@/components/ui/toggle";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
    const { toggleTheme, isDark } = useTheme();

    return (
        <Toggle
            pressed={isDark}
            onPressedChange={toggleTheme}
            className="h-10 w-10 p-0 border-0 bg-transparent hover:bg-sidebar-accent data-[state=on]:bg-transparent data-[state=off]:bg-transparent cursor-pointer group"
            title="Toggle theme"
        >
            {isDark ? (
                <Sun
                    size={24}
                    className="text-sidebar-accent-foreground group-hover:text-primary transition-colors duration-200"
                />
            ) : (
                <Moon
                    size={24}
                    className="text-sidebar-accent-foreground group-hover:text-primary transition-colors duration-200"
                />
            )}
        </Toggle>
    );
}