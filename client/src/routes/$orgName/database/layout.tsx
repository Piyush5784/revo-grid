
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/$orgName/database')({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="new-page flex flex-col">
			<Outlet />
		</div>
	);
}
