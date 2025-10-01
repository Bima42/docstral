import { useTheme } from '../hooks/useTheme';

export default function Home() {
	const { isDark } = useTheme();

	const colorGroups = [
		{
			name: 'Primary',
			colors: [
				{ name: 'primary-50', class: 'bg-primary-50' },
				{ name: 'primary-100', class: 'bg-primary-100' },
				{ name: 'primary-500', class: 'bg-primary-500' },
				{ name: 'primary-600', class: 'bg-primary-600' },
				{ name: 'primary-700', class: 'bg-primary-700' },
			]
		},
		{
			name: 'Red',
			colors: [
				{ name: 'red-100', class: 'bg-red-100' },
				{ name: 'red-500', class: 'bg-red-500' },
				{ name: 'red-600', class: 'bg-red-600' },
				{ name: 'red-700', class: 'bg-red-700' },
			]
		},
		{
			name: 'Amber',
			colors: [
				{ name: 'amber-100', class: 'bg-amber-100' },
				{ name: 'amber-400', class: 'bg-amber-400' },
				{ name: 'amber-500', class: 'bg-amber-500' },
				{ name: 'amber-600', class: 'bg-amber-600' },
			]
		},
		{
			name: 'Warm',
			colors: [
				{ name: 'warm-100', class: 'bg-warm-100' },
				{ name: 'warm-200', class: 'bg-warm-200' },
				{ name: 'warm-300', class: 'bg-warm-300' },
				{ name: 'warm-700', class: 'bg-warm-700' },
			]
		},
		{
			name: 'Neutral',
			colors: [
				{ name: 'neutral-50', class: 'bg-neutral-50' },
				{ name: 'neutral-100', class: 'bg-neutral-100' },
				{ name: 'neutral-200', class: 'bg-neutral-200' },
				{ name: 'neutral-400', class: 'bg-neutral-400' },
				{ name: 'neutral-600', class: 'bg-neutral-600' },
				{ name: 'neutral-800', class: 'bg-neutral-800' },
				{ name: 'neutral-900', class: 'bg-neutral-900' },
			]
		},
		{
			name: 'Surface',
			colors: [
				{ name: 'surface-light', class: 'bg-surface-light border border-neutral-200 dark:border-neutral-700' },
				{ name: 'surface-warm', class: 'bg-surface-warm border border-neutral-200 dark:border-neutral-700' },
				{ name: 'surface-neutral', class: 'bg-surface-neutral border border-neutral-200 dark:border-neutral-700' },
			]
		}
	];

	return (
		<div className="bg-surface-light min-h-screen transition-colors pt-3xl">
			<div className="max-w-6xl mx-auto py-2xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2 transition-colors">
                            Color Palette
					</h1>
					<p className="text-neutral-600 dark:text-neutral-400 transition-colors">
                            Current theme: <span className="font-medium text-neutral-800 dark:text-neutral-200">{isDark ? 'Dark' : 'Light'}</span>
					</p>
				</div>

				<div className="grid gap-8">
					{colorGroups.map((group) => (
						<div key={group.name} className="bg-surface-warm rounded-xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 transition-colors">
							<h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-4 transition-colors">
								{group.name}
							</h2>

							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
								{group.colors.map((color) => (
									<div key={color.name} className="group">
										<div
											className={`${color.class} rounded-lg h-20 w-full mb-2 shadow-sm ring-1 ring-black/5 dark:ring-white/10 transition-all group-hover:scale-105`}
										/>
										<div className="text-center">
											<p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 transition-colors">
												{color.name}
											</p>
											<code className="text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
												{color.class}
											</code>
										</div>
									</div>
								))}
							</div>
						</div>
					))}
				</div>

				{/* Usage Examples */}
				<div className="mt-12 bg-surface-warm rounded-xl p-6 shadow-sm border border-neutral-100 dark:border-neutral-800 transition-colors">
					<h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-6 transition-colors">
                            Usage Examples
					</h2>

					<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
						{/* Primary Button */}
						<div className="space-y-2">
							<button className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    Primary Button
							</button>
							<code className="block text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
                                    bg-primary-500 hover:bg-primary-600
							</code>
						</div>

						{/* Red Button */}
						<div className="space-y-2">
							<button className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                                    Red Button
							</button>
							<code className="block text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
                                    bg-red-500 hover:bg-red-600
							</code>
						</div>

						{/* Card Example */}
						<div className="space-y-2">
							<div className="bg-surface-light p-4 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-700 transition-colors">
								<p className="text-neutral-700 dark:text-neutral-300 text-sm transition-colors">Surface Card</p>
							</div>
							<code className="block text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
                                    bg-surface-light
							</code>
						</div>

						{/* Secondary Button */}
						<div className="space-y-2">
							<button className="bg-surface-light hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 px-4 py-2 rounded-lg font-medium border border-neutral-200 dark:border-neutral-700 transition-colors">
                                    Secondary Button
							</button>
							<code className="block text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
                                    bg-surface-light hover:bg-neutral-50
							</code>
						</div>

						{/* Warm Card */}
						<div className="space-y-2">
							<div className="bg-warm-100 dark:bg-warm-100 p-4 rounded-lg shadow-sm transition-colors">
								<p className="text-neutral-700 dark:text-neutral-300 text-sm transition-colors">Warm Accent</p>
							</div>
							<code className="block text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
                                    bg-warm-100
							</code>
						</div>

						{/* Text Variations */}
						<div className="space-y-2">
							<div className="bg-surface-light p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 transition-colors">
								<h3 className="text-neutral-900 dark:text-neutral-100 font-medium text-sm mb-1 transition-colors">Heading</h3>
								<p className="text-neutral-600 dark:text-neutral-400 text-xs transition-colors">Body text</p>
							</div>
							<code className="block text-xs text-neutral-500 dark:text-neutral-400 font-mono transition-colors">
                                    text-neutral-900 dark:text-neutral-100
							</code>
						</div>
					</div>
				</div>

			</div>
		</div>
	);
}