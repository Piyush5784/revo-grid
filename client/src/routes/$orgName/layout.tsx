
import { useMantineColorScheme } from '@mantine/core';
import { createFileRoute, Outlet, useNavigate } from '@tanstack/react-router';
import { Toaster } from 'sonner';

import Sidebar from '~client/lib/sidebar/sidebar';
import { MOCK_ORG_DATA, useMockUser } from '~client/utils/mock-data';

export const Route = createFileRoute('/$orgName')({
	component: RouteComponent,
});

function RouteComponent() {
	const org = MOCK_ORG_DATA;
	
	if (!org) {
		return (
			<div>
				<h1>Org not found</h1>
			</div>
		);
	}

	return (
		<>
			<Sidebar>
				<Outlet />
			</Sidebar>
			<CustomSonner />
		</>
	);
}

const CustomSonner = () => {
	const { colorScheme } = useMantineColorScheme();
	const sonnerScheme: 'light' | 'dark' | 'system' = colorScheme === 'auto' ? 'system' : colorScheme;
	return <Toaster richColors theme={sonnerScheme} />;
};
