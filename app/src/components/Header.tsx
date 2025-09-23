import { Link } from '@tanstack/react-router';
import { useTheme } from '../hooks/useTheme';
import { useLanguage } from '../hooks/useLanguage';

export default function Header() {
	const { toggleTheme, isDark } = useTheme();
	const { toggleLanguage, getLanguageDisplay } = useLanguage();

	return (
		<header className="fixed top-lg left-1/2 transform -translate-x-1/2 z-50 w-full max-w-container-lg mx-auto px-md">
			<div className="backdrop-blur-md bg-background/80 border border-primary/20 rounded-2xl px-xl py-lg shadow-lg" style={{ height: 'var(--size-header-height)' }}>
				<nav className="flex items-center justify-between h-full">
					{/* Logo */}
					<div className="flex items-center gap-lg">
						<Link to="/" className="w-10 h-10 bg-primary rounded-full flex items-center justify-center hover:bg-primary/80 transition-colors">
							<span className="text-foreground font-bold">TP</span>
						</Link>
            
						{/* Vertical separator */}
						<div className="w-px h-6 bg-primary/30"></div>
            
					</div>

					<div className="flex items-center gap-lg">
						{/* Vertical separator */}
						<div className="w-px h-6 bg-primary/30"></div>
            
						{/* Language toggle */}
						<button
							onClick={toggleLanguage}
							className="rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center"
							style={{ width: 'var(--size-button-height)', height: 'var(--size-button-height)' }}
							title="Changer de langue"
						>
							<span className="text-foreground font-medium text-sm">{getLanguageDisplay()}</span>
						</button>
            
						{/* Theme toggle */}
              
						<button
							onClick={toggleTheme}
							className="rounded-full bg-primary/10 hover:bg-primary/20 transition-colors flex items-center justify-center"
							style={{ width: 'var(--size-button-height)', height: 'var(--size-button-height)' }}
							title="Changer de thème"
						>
							{isDark ? (
								<svg style={{ width: 'var(--size-icon)', height: 'var(--size-icon)' }} className="text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
								</svg>
							) : (
								<svg style={{ width: 'var(--size-icon)', height: 'var(--size-icon)' }} className="text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
								</svg>
							)}
						</button>
					</div>
				</nav>
			</div>
		</header>
	);
}