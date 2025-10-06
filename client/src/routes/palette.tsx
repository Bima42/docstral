import Palette from '@/pages/Palette';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/palette')({
	component: Palette,
});