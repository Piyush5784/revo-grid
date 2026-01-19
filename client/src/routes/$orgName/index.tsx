import { createFileRoute, Navigate } from '@tanstack/react-router';

export const Route = createFileRoute('/$orgName/')({
	component: RouteComponent,
});

function RouteComponent() {
	const { orgName } = Route.useParams();
	return <Navigate to="/$orgName/home" params={{ orgName }} />;
}
