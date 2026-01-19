import { Badge, Button, Card, Group, Image, Stack, Text } from '@mantine/core';
import React from 'react';
import { LuClock } from 'react-icons/lu';

export interface FeatureCardProps {
	// Core content
	title: string
	description: string
	// Visual content
	image?: string
	imagePosition?: 'top' | 'bottom' | 'background'
	imageAlt?: string

	// Action elements
	primaryButton?: {
		text: string
		href?: string
		onClick?: () => void
		variant?: 'default' | 'outline' | 'filled' | 'light' | 'subtle'
		icon?: React.ReactNode
		iconPosition?: 'left' | 'right'
	}

	secondaryButton?: {
		text: string
		href?: string
		onClick?: () => void
		variant?: 'default' | 'outline' | 'filled' | 'light' | 'subtle'
		icon?: React.ReactNode
		iconPosition?: 'left' | 'right'
	}

	linkButton?: {
		text: string
		href?: string
		onClick?: () => void
		icon?: React.ReactNode
		iconPosition?: 'left' | 'right'
	}
	// Add a new property for the component button
	componentButton?: React.ReactNode

	// Metadata badges
	setupTime?: string
	codeRequired?: boolean | 'low' | 'medium' | 'high'
	badges?: {
		text: string
		color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray'
	}[]

	// Additional content (if needed)
	children?: React.ReactNode

}

export default function FeatureCard({
	// Core content
	title,
	description,

	// Visual content
	image,
	imagePosition,
	imageAlt,

	// Action elements
	primaryButton,
	secondaryButton,
	componentButton,

	linkButton,

	// Metadata badges
	setupTime,
	codeRequired,
	badges = [],

	// Additional content
	children,

}: FeatureCardProps) {
	// Prepare badges array including setupTime and codeRequired if provided
	const allBadges = [...badges];

	// Use green color for the time badge
	if (setupTime) {
		allBadges.push({
			text: `Set up in ${setupTime}`,
			color: 'green',

		});
	}

	// Use blue color for the code badge
	if (codeRequired !== undefined) {
		let codeText = 'Code required';
		if (codeRequired === false) codeText = 'No code required';
		else if (codeRequired === 'low') codeText = 'Low code';
		else if (codeRequired === 'medium') codeText = 'Medium code';
		else if (codeRequired === 'high') codeText = 'High code';

		allBadges.push({
			text: codeText,
			color: 'blue',
		});
	}

	// Define the renderImage function
	const renderImage = () => {
		if (!image) return null;

		return (
			<div className="relative mt-2 h-48 overflow-hidden rounded-lg border border-b-0 border-stone-200 bg-stone-50 dark:bg-stone-900/50">
				<img
					src={image}
					alt={imageAlt || title}
					className=" px-10 pt-5 transition-transform duration-300 group-hover:scale-105"
				/>
			</div>
		);
	};

	return (
		<div className="group overflow-hidden rounded-lg bg-white dark:bg-stone-800 ">
			{/* Render image at bottom if specified */}
			{imagePosition === 'bottom' && renderImage()}
			<div className="py-4">
				<Text className="mb-2 text-[14px] font-[700] text-stone-800 dark:text-stone-200">{title}</Text>

				<Text className="mb-3 text-[14px] font-[400] text-stone-700 dark:text-stone-400">
					{description}
				</Text>

				{allBadges.length > 0 && (
					<Group className="mb-4  gap-2">
						{allBadges.map((badge, index) => {
							// Define style based on badge color
							let backgroundColor = '#f1f5f9';
							let borderColor = '#e2e8f0';
							let textColor = '#1e293b';

							if (badge.color === 'green') {
								backgroundColor = '#d1fae5';
								borderColor = '#6ee7b7';
								textColor = '#065f46';
							} else if (badge.color === 'blue') {
								backgroundColor = '#dbeafe';
								borderColor = '#93c5fd';
								textColor = '#1e3a8a';
							}

							return (
								<div
									key={index}
									className="flex items-center rounded-md px-2  text-[12px] font-[400]"
									style={{
										backgroundColor,
										border: `1px solid ${borderColor}`,
										color: textColor,
									}}
								>
									{badge.text}
								</div>
							);
						})}
					</Group>

				)}

				{children}

				{(primaryButton || secondaryButton || linkButton) && (
					<Group className="mt-3  gap-2">
						{primaryButton && (
							<Button
								component={primaryButton.onClick ? 'button' : 'a'}
								variant={primaryButton.variant || 'default'}
								size="xs"
								href={primaryButton.href}
								onClick={primaryButton.onClick}
								leftSection={primaryButton.icon && primaryButton.iconPosition !== 'right' ? primaryButton.icon : undefined}
								rightSection={primaryButton.icon && primaryButton.iconPosition === 'right' ? primaryButton.icon : undefined}
							>
								{primaryButton.text}
							</Button>
						)}

						{secondaryButton && (
							<Button
								component={secondaryButton.onClick ? 'button' : 'a'}
								variant={secondaryButton.variant || 'default'}
								size="xs"
								href={secondaryButton.href}
								onClick={secondaryButton.onClick}
								leftSection={secondaryButton.icon && secondaryButton.iconPosition !== 'right' ? secondaryButton.icon : undefined}
								rightSection={secondaryButton.icon && secondaryButton.iconPosition === 'right' ? secondaryButton.icon : undefined}
							>
								{secondaryButton.text}
							</Button>
						)}

						{linkButton && (
							<a
								href={linkButton.href}
								onClick={linkButton.onClick}
								className="inline-flex items-center py-1 text-[12px] font-[600] text-blue-500 hover:underline"
							>
								{linkButton.icon && linkButton.iconPosition !== 'right' && (
									<span className="mr-1">{linkButton.icon}</span>
								)}
								{linkButton.text}
								{linkButton.icon && linkButton.iconPosition === 'right'
									? (
										<span className="ml-1">{linkButton.icon}</span>
									)
									: (
										' →'
									)}
							</a>
						)}

						{componentButton && (
							<div>
								{componentButton}
							</div>
						)}
					</Group>
				)}
			</div>

		</div>
	);
}
