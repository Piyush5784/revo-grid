import { Loader } from '@mantine/core';

import { cn } from '~client/lib/utils';

function CoyaxLoader({ className }: { className?: string }) {
	return (
		<div className={cn('flex size-full items-center justify-center', className)}>
			<Loader />
		</div>
	);
}

export default CoyaxLoader;
