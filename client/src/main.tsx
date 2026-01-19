import '@mantine/dropzone/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/core/styles.css';
import '@revolist/revogrid-pro/dist/revogrid-pro.css';
import '~client/index.css';
import '~client/styles/button.css';
import '~client/styles/form.css';
import '~client/styles/input.css';
import '~client/styles/modal.css';
import '~client/styles/tooltip.css';

import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { createRoot } from 'react-dom/client';

import { theme } from '~client/routes/-mantine-theme';
import { routeTree } from '~client/routeTree.gen';
import { queryClient } from '~client/utils/query-client';

export const router = createRouter({
	routeTree,
	defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
	interface Register {
		router: typeof router
	}
}

export const tanStackRouterDevToolsOpenBtnId = 'tanstack-router-open-btn';
export const openTanStackRouterDevtools = () => {
	const btn = document.querySelector(`#${tanStackRouterDevToolsOpenBtnId}`);
	if (btn) (btn as HTMLButtonElement).click();
	else console.error('TanStack Router Devtools button not found');
};
export const openTanStackReactQueryDevtools = () => {
	const btn = document.querySelector('.tsqd-open-btn');
	if (btn) (btn as HTMLButtonElement).click();
	else console.error('TanStack React Query Devtools button not found');
};

let serverUrl = '';
export function AllProviders({ children }: { children: React.ReactNode }) {

	return (
		<QueryClientProvider client={queryClient}>
			<MantineProvider theme={theme} defaultColorScheme="light">
				<ModalsProvider>

					{/* <Notifications position="bottom-right" /> */}
					{children}
				</ModalsProvider>
			</MantineProvider>
		</QueryClientProvider>
		
	);
}


const rootElement = document.getElementById('root')!;
if (!rootElement.innerHTML) {
	const root = createRoot(rootElement);
	root.render(
			<AllProviders>
				<RouterProvider router={router} />
				<TanStackRouterDevtools
					router={router}
					initialIsOpen={false}
					toggleButtonProps={{
						id: tanStackRouterDevToolsOpenBtnId,
						className: '!hidden',
					}}
				/>
			</AllProviders>
	);
}

export { serverUrl };
