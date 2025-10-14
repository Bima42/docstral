import PalettePage from '@/pages/PalettePage';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/palette')({
	component: PalettePage,
});