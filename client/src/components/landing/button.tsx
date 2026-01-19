import { ArrowUpRight } from 'lucide-react';

import { cn } from '~client/lib/utils';

export default function Button({ children, onClick, variant = 'secondary' }: { children: React.ReactNode, onClick?: () => void, variant?: 'secondary' | 'link' | 'shining' | 'swipe' | 'primary' | 'lift' | "sketch" | "outline" | "rainbow" }) {
	if (variant === 'secondary') {
		return (
			<button className="focus:ring-3 focus:outline-hidden group relative inline-block text-sm font-medium" {...onClick && { onClick }}>
				<span className="absolute inset-0 rounded-lg border border-[#FD9A3E]"></span>
				<span
					className="block whitespace-nowrap rounded-lg border border-[#FD9A3E] bg-white px-6 py-2 text-[16px] transition-transform group-hover:-translate-x-1 group-hover:-translate-y-1"
				>
					{children}
				</span>
			</button>
		);
	} else if (variant === 'shining') {
		return (
			<button className="group cursor-pointer rounded-xl border-4 border-[#FD9A3E] border-opacity-0 bg-transparent p-1 transition-all duration-500 hover:border-opacity-100" {...onClick && { onClick }}>
				<div className="relative flex items-center justify-center gap-4 overflow-hidden rounded-lg bg-[#FD9A3E] px-8 py-3 font-bold text-white">
					{children}
					<div
						className={cn(
							'absolute -left-16 top-0 h-full w-12 rotate-[30deg] scale-y-150 bg-white/10 transition-all duration-700 group-hover:left-[calc(100%+1rem)]',
						)}
					/>
				</div>
			</button>
		);
	} else if (variant === 'swipe') {
		const common = 'block h-8 px-3 text-sm font-medium duration-300 ease-in-out flex items-center justify-center';
		return (
			<button
				className={cn('group relative min-w-fit overflow-hidden rounded-lg')}
				{...onClick && { onClick }}
			>
				<span
					className={cn(
						'absolute inset-0 translate-y-full group-hover:translate-y-0',
						common,
						'bg-[#1A4A5A] text-white',
					)}
				>
					{children}
				</span>
				<span className={cn('group-hover:-translate-y-full', common, 'bg-[#FD9A3E] text-white')}>{children}</span>
			</button>
		);
	} else if (variant === 'link') {
		return (
			<button className="group flex items-center justify-center gap-2 text-[16px] text-[#1A4A5A] hover:cursor-pointer" {...onClick && { onClick }}>
				<span className="underline underline-offset-4">{children}</span>
				<ArrowUpRight
					height={20}
					width={20}
					className="text-[#FD9A3E] transition-all group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:scale-110"
				/>
			</button>
		);
	} else if (variant === 'primary') {
		return (
			<button className="group relative overflow-hidden rounded-lg bg-[#031749] px-6 py-2 text-[16px] transition-all">
				<span className="absolute bottom-0 left-0 h-48 w-full origin-bottom translate-y-full overflow-hidden rounded-lg bg-white/15 transition-all duration-300 ease-out group-hover:translate-y-14"></span>
				<span className="text-white">{children}</span>
			</button>
		);
	} else if (variant === "lift") {
		return (
			<button className="h-8 px-3 bg-stone-800 text-white text-sm rounded-lg font-medium transform hover:-translate-y-1 transition duration-400 flex items-center justify-center" onClick={onClick}>
				{children}
			</button>
		)
	} else if (variant === "sketch") {
		return (
			<button className="h-8 px-3 rounded-lg border border-stone-300 bg-white text-stone-800 text-sm font-medium hover:shadow-[4px_4px_0px_0px_rgba(0,0,0)] transition duration-400" onClick={onClick}>
				{children}
			</button>
		)
	} else if (variant === "outline") {
		return (
			<button className="w-fit px-6 py-3 rounded-xl border border-stone-300 text-stone-800 bg-white hover:bg-stone-100 transition duration-200 text-sm" onClick={onClick}>
				{children}
			</button>
		)
	} else if (variant === "rainbow") {
		return (
			<div className="relative inline-flex overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50">
				<span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(at_center,_red,_orange,_yellow,_green,_blue,_indigo,_violet,_red)]" />
				<span className="inline-flex h-full w-full items-center justify-center rounded-full bg-white px-2 py-1 text-xs text-stone-800 backdrop-blur-3xl">
					{children}
				</span>
			</div>
		)
	} else {
		return null;
	}
}
