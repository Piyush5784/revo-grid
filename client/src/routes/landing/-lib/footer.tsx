import { Link } from '@tanstack/react-router';
import { motion } from 'motion/react';
import { Linkedin } from 'lucide-react';

export default function Footer() {
	return (
		<footer className="w-full px-7 pt-20 pb-10 md:pb-14 xl:pt-28 xl:pb-12">
			<motion.div
				initial={{ opacity: 0, y: 40 }}
				whileInView={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.8 }}
				viewport={{ once: true }}
				className='max-w-[1296px] mx-auto'
			>
				<div className="flex flex-col gap-10 lg:flex-row lg:justify-between lg:items-start">
					<motion.div
						initial={{ opacity: 0, x: -30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						viewport={{ once: true }}
						className="w-full md:w-[500px] lg:w-2/5 flex flex-col gap-4"
					>
						<Link to="/landing" className="flex items-center">
							<img src="/logo.png" alt="Coyax AI" className='size-8' />
							<div className="text-xl font-bold text-stone-800 ml-2">
								Coyax
							</div>
						</Link>
						<p className="text-sm text-stone-500 leading-relaxed">
							Collaborative Intelligence to reduce cash cycles, Coyax AI integrates with your CRM and supplier systems, accelerating L2C and P2P processes to unlock cash flow and reduce delays.
						</p>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 30 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.4 }}
						viewport={{ once: true }}
						className="flex flex-col w-full lg:w-2/5 sm:flex-row gap-10"
					>
						<div className='flex-1'>
							<div className="text-sm mb-4 text-stone-500 font-medium">Company</div>
							<ul className="space-y-3 text-sm text-stone-800">
								<li><a href="/landing" className="hover:underline">Home</a></li>
								<li><a href="/landing/about-us" className="hover:underline">About</a></li>
								<li><a href="/landing/contact" className="hover:underline">Partners</a></li>
								<li><a href="#" className="hover:underline">Blog</a></li>
								<li><a href="#" className="hover:underline">Contact</a></li>
							</ul>
						</div>
						<div className='flex-1'>
							<div className="text-sm mb-4 text-stone-500 font-medium">Legal</div>
							<ul className="space-y-3 text-sm text-stone-800">
								<li><a href="/landing/terms-of-service" className="hover:underline">Terms of service</a></li>
								<li><a href="/landing/privacy-policy" className="hover:underline">Privacy policy</a></li>
								<li><a href="/landing/cookies-settings" className="hover:underline">Cookies</a></li>
							</ul>
						</div>
					</motion.div>
				</div>
				<motion.div
					initial={{ opacity: 0, scaleX: 0 }}
					whileInView={{ opacity: 1, scaleX: 1 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					viewport={{ once: true }}
					className="my-8 border-t border-stone-300"
				/>
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.8 }}
					viewport={{ once: true }}
					className="flex flex-col sm:flex-row items-center justify-between gap-4 text-stone-800"
				>
					<div className='text-sm'>
						© {new Date().getFullYear()} Coyax Inc. All rights reserved.
					</div>
					<div className="flex gap-4">
						<a href="https://www.linkedin.com/company/coyax-ai/" target='_blank'>
							<Linkedin size={18} />
						</a>
					</div>
				</motion.div>
			</motion.div>
		</footer>
	);
}
