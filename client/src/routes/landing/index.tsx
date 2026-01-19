import './landing.css';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { useUserOrg } from '~client/utils/utils';

import Layout from './-lib/layout';
import Footer from './-lib/footer';

export const Route = createFileRoute('/landing/')({
	component: LandingPage,
});

function LandingPage() {
	const navigate = useNavigate();
	const userOrg = useUserOrg();
	
	// 🔍 DEBUG: Check user org data
	console.log('🏠 [LandingPage] User Org:', userOrg);

	useEffect(() => {
		if (window.location.hash === '#features') {
			const el = document.getElementById('features');
			if (el) el.scrollIntoView({ behavior: 'smooth' });
		} else {
			window.scrollTo(0, 0);
		}
	}, []);

	if (userOrg) {
		navigate({ to: `/${userOrg.name.toLowerCase()}` });
	}

	return (
		<Layout>
		</Layout>
	);
}

export default LandingPage;
