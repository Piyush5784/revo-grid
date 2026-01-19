import type { PropsWithChildren } from 'react';

import Footer from './footer';
import Header from './header';

export default function Layout({ children }: PropsWithChildren) {
	return (
		<div className="flex flex-col items-center justify-center">
			<Header />
			<div className="size-full">
				{children}
			</div>
			<Footer />
		</div>
	);
}
