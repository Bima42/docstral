type LogoProps = {
    width?: number;
    height?: number;
}
export const Logo = ({ width = 120, height = 80 }: LogoProps) => {
	return (
		<img src={'/docstral-no-bg.png'} alt={'docstral-logo'} loading={'lazy'} width={width} height={height} />
	);
};