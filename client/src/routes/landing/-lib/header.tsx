
import { useNavigate } from '@tanstack/react-router';
import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { twJoin, twMerge } from 'tailwind-merge';
import { useMediaQuery, useWindowScroll } from '@mantine/hooks';

import Button from '~client/components/landing/button';
import { useUserOrg } from '~client/utils/utils';
import { useMockUser } from '~client/utils/mock-data';

const navLinks = [
	{ name: 'Home', to: '/landing' },
	{ name: 'Features', to: '#landing-features' },
	{ name: 'About', to: '/landing/about-us' },
	{ name: 'Partners', to: '/landing/partners' },
	{ name: 'Blog', to: '/landing/blog_page' },
	{ name: 'Contact', to: '/landing/contact' },
];

const NavLinks = ({ className }: { className?: string }) => {
	return (
		<nav className={twJoin(className && className)}>
			{navLinks.map(link => {
				return (
					<a
						key={link.name}
						href={link.to}
						className={twMerge("relative w-fit text-sm font-medium text-stone-800 hover:bg-stone-500/10 transition-colors px-3 h-8 flex items-center justify-center rounded-md")}
					>
						{link.name}
					</a>
				)
			})}
		</nav>
	);
};

const ActionButtons = ({ className }: { className?: string }) => {
	const userOrg = useUserOrg();
	const navigate = useNavigate();

	const hasSignedIn = true;

	return (
		<div className={twMerge("w-full flex items-center gap-3", className && className)}>
			<Button
				variant="sketch"
				onClick={() => {
					if (hasSignedIn) {
						navigate({ to: '/$orgName', params: { orgName: userOrg?.name.toLowerCase() || 'default' } });
					} else {
						navigate({ to: '/sign-in' });
					}
				}}
			>
				{hasSignedIn ? 'Dashboard' : 'Login'}
			</Button>
			<Button variant="lift" onClick={() => window.open('https://cal.com/piyush-coyax/60min', '_blank')}>
				Book a Demo
			</Button>
		</div>
	);
};

export default function Header() {
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	const matches = useMediaQuery('(min-width: 1024px)');

	const [scroll] = useWindowScroll();

	useEffect(() => {
		// close mobile menu when switching to desktop
		if (matches && isMenuOpen) {
			setIsMenuOpen(false);
		}
	}, [matches])

	return (
		<header className={twMerge("fixed top-0 left-0 right-0 z-50 bg-transparent py-4 px-5 xl:py-5 xl:px-8 transition-colors", scroll.y > 70 && "bg-white shadow-sm")}>
			<div className="max-w-[1296px] mx-auto">
				<div className="flex items-center gap-3">
					<a href="/landing" className="flex items-center">
						<img src="/logo.png" alt="Coyax AI" className='size-8' />
						<div className="text-xl font-bold text-stone-800 ml-2 mr-3">
							Coyax
						</div>
					</a>
					<div className='flex-1 flex items-center justify-between'>
						<NavLinks className="hidden lg:flex lg:items-center gap-3" />
						{/* Action Buttons */}
						<div className="hidden lg:flex items-center space-x-4">
							<ActionButtons />
						</div>
					</div>

					{/* Mobile Menu Button */}
					<button
						onClick={() => setIsMenuOpen(!isMenuOpen)}
						className="lg:hidden rounded-lg text-stone-500 size-7 relative"
					>
						<span className={twJoin(
							'absolute block h-0.5 w-full bg-current transform transition-all duration-300',
							isMenuOpen ? 'rotate-45 top-3' : 'top-1'
						)} />
						<span className={twJoin(
							'absolute block h-0.5 w-full bg-current transform transition-all duration-300 top-3',
							isMenuOpen ? 'opacity-0' : 'opacity-100'
						)} />
						<span className={twJoin(
							'absolute block h-0.5 w-full bg-current transform transition-all duration-300',
							isMenuOpen ? '-rotate-45 top-3' : 'top-5'
						)} />
					</button>
				</div>

				{/* Mobile Menu */}
				<AnimatePresence>
					{isMenuOpen && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: 'auto' }}
							exit={{ opacity: 0, height: 0 }}
							transition={{ duration: 0.2 }}
							className="lg:hidden bg-white/95 backdrop-blur-lg flex flex-col items-center"
						>
							<NavLinks className='space-y-3 flex flex-col items-center' />
							<ActionButtons className='*:w-full mt-3' />
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</header >
	);
}
