import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export default function Home() {
	const { theme, isDark } = useTheme();
	const { t } = useLanguage();
  
	return (
		<div className="min-h-screen bg-background pt-3xl">
			<div className="container mx-auto px-lg py-2xl max-w-container-lg">
				<h1 className="text-4xl font-bold text-foreground mb-xl">{t('pages.home.title')}</h1>
        
				<div className="grid gap-lg mb-2xl">
					<div className="bg-primary p-xl rounded-xl">
						<h2 className="text-foreground font-bold mb-md">{t('pages.home.darkModeTest')}</h2>
						<p className="text-foreground/80">{t('pages.home.currentMode')}: <strong>{t(`theme.${theme}`)}</strong></p>
						<p className="text-foreground/80">isDark: <strong>{isDark ? 'true' : 'false'}</strong></p>
					</div>
          
					<div className="bg-secondary p-lg rounded-lg">
						<p className="text-white font-bold">{t('pages.home.secondaryColor')}</p>
						<p className="text-white/80">{t('pages.home.shouldChange')}</p>
					</div>
          
					<div className="bg-foreground p-md rounded-md">
						<p className="text-background font-bold">{t('pages.home.invertedContrast')}</p>
						<p className="text-background/80">{t('pages.home.textOnForeground')}</p>
					</div>
				</div>
        
				{/* Cards with variations */}
				<div className="grid md:grid-cols-2 gap-lg">
					<div className="bg-white dark:bg-gray-800 p-xl rounded-xl border">
						<h3 className="text-gray-900 dark:text-white font-bold mb-md">{t('pages.home.tailwindVariant')}</h3>
						<p className="text-gray-600 dark:text-gray-300">{t('pages.home.tailwindDescription')}</p>
					</div>
          
					<div className="bg-primary/20 dark:bg-primary/10 p-xl rounded-xl">
						<h3 className="text-foreground font-bold mb-md">{t('pages.home.cssVariables')}</h3>
						<p className="text-foreground/70">{t('pages.home.cssDescription')}</p>
					</div>
				</div>
			</div>
		</div>
	);
}