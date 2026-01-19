'use client';
import { Button } from '@mantine/core';
import {
	motion,
	useMotionValueEvent,
	useScroll,
	useSpring,
	useTransform,
} from 'motion/react';
import React, { useEffect, useRef, useState } from 'react';

interface TimelineEntry {
	title: string
	content: React.ReactNode
	description?: React.ReactNode
	integrations?: {
		title: string
		items: {
			name: string
			icon?: React.ReactNode
		}[]
	}[]
}

export const NewTimeline = ({ data }: { data: TimelineEntry[] }) => {
	const containerRef = useRef<HTMLDivElement>(null);
	const lineRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		// Simple scroll handler that doesn't rely on Framer Motion
		const handleScroll = () => {
			if (!containerRef.current || !lineRef.current) return;

			const container = containerRef.current;
			const line = lineRef.current;

			// Get container position relative to viewport
			const containerRect = container.getBoundingClientRect();
			const containerTop = containerRect.top;
			const containerHeight = containerRect.height;
			const windowHeight = window.innerHeight;

			// Calculate how much of the container is visible
			let visiblePercentage = 0;

			if (containerTop < windowHeight && containerTop + containerHeight > 0) {
				// Container is at least partially visible
				const visibleTop = Math.max(0, containerTop);
				const visibleBottom = Math.min(windowHeight, containerTop + containerHeight);
				const visibleHeight = visibleBottom - visibleTop;

				// Calculate percentage scrolled through the container
				visiblePercentage = (windowHeight - containerTop) / (containerHeight + windowHeight);
				visiblePercentage = Math.max(0, Math.min(1, visiblePercentage));
			}

			// Apply the height to the line
			line.style.height = `${visiblePercentage * 100}%`;
			line.style.opacity = visiblePercentage > 0 ? '1' : '0';
		};

		window.addEventListener('scroll', handleScroll);
		handleScroll(); // Initial calculation

		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div
			ref={containerRef}
			className="w-full max-w-[1500px] px-4 md:px-8 lg:px-16"
		>
			<div className="relative max-w-7xl pb-0">
				{/* Timeline vertical line */}
				<div
					className="absolute left-5 top-0 h-full w-[2px] overflow-hidden bg-stone-200 dark:bg-stone-700"
				>
					<div
						ref={lineRef}
						className="timeline-vertical-line h-0 w-full"
						style={{ height: '0%', opacity: 0 }}
					/>
				</div>

				{data.map((item, index) => (
					<div
						key={index}
						className="flex flex-col justify-between pt-10 md:flex-row md:pt-40"
					>
						{/* Left column - Title, description, integrations */}
						<div className="relative z-40 w-full md:sticky md:top-40 md:w-2/4">
							<div className="relative flex flex-col">
								<div className="absolute left-0 flex size-10 items-center justify-center rounded-full bg-white dark:bg-black">
									<motion.div
										initial={{ scale: 0.8 }}
										whileInView={{ scale: 1 }}
										transition={{
											type: 'spring',
											stiffness: 100,
											damping: 10,
											delay: 0.05,
										}}
										className="timeline-bullet size-4 rounded-full border border-stone-300 dark:border-stone-700"
									/>
								</div>

								<div className="flex flex-col">
									<motion.p
										initial={{ x: -50, opacity: 0 }}
										whileInView={{ x: 0, opacity: 1 }}
										transition={{
											type: 'spring',
											stiffness: 100,
											damping: 15,
											delay: 0.1,
										}}
										className="timeline-title pl-20 text-2xl font-[600] text-stone-800 dark:text-stone-500 md:pl-16 md:text-3xl"
									>
										{item.title}
									</motion.p>

									{/* Description */}
									{item.description && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											whileInView={{ opacity: 1, y: 0 }}
											transition={{
												type: 'spring',
												stiffness: 50,
												damping: 20,
												delay: 0.3,
											}}
											className="timeline-description mt-3 max-w-md pl-20 text-[16px] font-[500] text-stone-700 dark:text-stone-300 md:pl-16"
										>
											{item.description}
										</motion.div>
									)}

									{/* Integrations Section */}
									{item.integrations && item.integrations.length > 0 && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											whileInView={{ opacity: 1, y: 0 }}
											transition={{
												type: 'spring',
												stiffness: 50,
												damping: 20,
												delay: 0.4,
											}}
											className="mt-6 pl-20 md:pl-16"
										>
											{item.integrations.map((integration, idx) => (
												<div key={idx} className="mb-4">
													<h3 className="mb-2 text-[14px] font-[600] text-stone-800 dark:text-stone-400">
														{integration.title}
													</h3>
													<div className="flex flex-wrap gap-2">
														{integration.items.map((item, itemIdx) => (
															<div
																key={itemIdx}
																className="flex items-center justify-center border border-stone-400 px-3 py-1 dark:border-stone-700"
															>
																{item.icon && (
																	<span className="mr-2">{item.icon}</span>
																)}
																<span className="text-base font-medium">{item.name}</span>
															</div>
														))}
													</div>
												</div>
											))}
										</motion.div>
									)}
								</div>
							</div>
						</div>

						{/* Right column - Content/Images */}
						<div className="mt-8 w-full md:mt-0 md:w-2/4 md:pl-8">
							<div className="max-w-full">
								<div className="relative z-30">
									{item.content}
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};
