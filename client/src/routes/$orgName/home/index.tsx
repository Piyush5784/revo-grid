import { Space } from '@mantine/core';
import { createFileRoute } from '@tanstack/react-router';
export const Route = createFileRoute('/$orgName/home/')({
	component: RouteComponent,
});

function RouteComponent() {

	return (
		<div className="page">
			<Space h="sm" />

			{/* Welcome message */}
			<div className="mb-2 px-3">
				<p className="text-[14px] font-[400] text-stone-500">My workspace</p>
				<h1 className="text-2xl font-medium text-stone-900">
					Click on the order Table
				</h1>
			</div>
		</div>
	);
}
