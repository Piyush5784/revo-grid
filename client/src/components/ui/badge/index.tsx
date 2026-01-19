import { Badge as MantineBadge, type BadgeProps } from '@mantine/core';
import { twJoin } from 'tailwind-merge';

export const BADGE_COLORS = {
	// Bright pink
	pink: {
		border: '#f9a8d4',
		background: '#fce7f3',
		text: '#be185d',
	},
	// Sunny yellow
	yellow: {
		border: '#fde047',
		background: '#fef9c3',
		text: '#854d0e',
	},
	// Electric purple
	purple: {
		border: '#c084fc',
		background: '#f3e8ff',
		text: '#7e22ce',
	},
	// Vibrant orange
	orange: {
		border: '#fb923c',
		background: '#ffedd5',
		text: '#c2410c',
	},
	// Bright teal
	teal: {
		border: '#2dd4bf',
		background: '#ccfbf1',
		text: '#115e59',
	},
	// Electric blue
	blue: {
		border: '#38bdf8',
		background: '#e0f2fe',
		text: '#0369a1',
	},
	// Lime green
	lime: {
		border: '#a3e635',
		background: '#ecfccb',
		text: '#3f6212',
	},
	// Ruby red
	ruby: {
		border: '#fb7185',
		background: '#ffe4e6',
		text: '#be123c',
	},
	// Bright indigo
	indigo: {
		border: '#818cf8',
		background: '#e0e7ff',
		text: '#3730a3',
	},
	// Vibrant cyan
	cyan: {
		border: '#22d3ee',
		background: '#cffafe',
		text: '#155e75',
	},
	green: {
		background: '#D1FAE5', // light green
		border: '#6ee7b7', // medium green
		text: '#065f46', // dark green
	},
	red: {
		background: '#fee2e2', // light red
		border: '#fca5a5', // medium red
		text: '#991b1b', // dark red
	},
	gray: {
		border: '#94a3b8',
		background: '#f1f5f9',
		text: '#334155',
	},
};

export function Badge({ children, ...props }: BadgeProps) {
	const color = BADGE_COLORS[props.color as keyof typeof BADGE_COLORS];

	return (
		<MantineBadge
			{...props}
			style={{
				background: color.background,
				border: `1px solid ${color.border}`, // Consistent with home-card.tsx
				color: color.text,
				...props.style,
			}}
			className={twJoin(
				'rounded-md px-2', // Match the home-card.tsx style
				'text-[12px] font-[400]',
				'transition-colors duration-200',
			)}
		>
			{children}
		</MantineBadge>
	);
}
