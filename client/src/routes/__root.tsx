import { createRootRoute, Outlet } from '@tanstack/react-router';

// Note - we can't use createRootRouteWithContext due to a bug in tanstack router beforeLoad that adds 400ms delay. See app/layout.tsx for more info. Keeping this for reference if the bug is fixed.
// export interface RouterContext {
// 	isLoaded: boolean
// 	isSignedIn: boolean
// }
// createRootRouteWithContext<RouterContext>()

export const Route = createRootRoute({
	component: () => <Outlet />,
});

export default Route;
