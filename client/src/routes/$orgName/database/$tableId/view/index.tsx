import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect } from 'react';

import { getOrgName } from '~client/utils/utils';

export const Route = createFileRoute('/$orgName/database/$tableId/view/')({
	component: RouteComponent,
});

function RouteComponent() {
	const navigate = useNavigate();
	const { tableId } = Route.useParams();
	const orgName = getOrgName();

	useEffect(() => {
		navigate({ to: `/coyaxai/database/dd31d6db-156c-4986-88f0-9ade4b69f8b6/view/004e38f8-b24b-4faa-a3fb-86944b3f5652` });
		// }
	}, []);

	return <div>Redirecting...</div>;
}
