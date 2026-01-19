import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import { Select } from '@mantine/core';

import { Pagination } from '~client/components/ui';

const ROW_LIMITS = [100, 200, 500];

export const paginationState$ = observable({
	page: 1,
	limit: ROW_LIMITS[0]!,
	total: 0,
});

export default function TableFooter() {
	const pagination = use$(paginationState$);
	const totalPages = Math.ceil(pagination.total / pagination.limit);

	return (
		<div className="flex w-full items-center justify-between gap-4 border-t border-stone-200 bg-stone-50 px-6 py-2">
			<div className="flex items-center gap-2">
				<span className="text-xs text-stone-800">{pagination.page * pagination.limit - pagination.limit + 1} - {pagination.page * pagination.limit} of {pagination.total} rows</span>
				<Pagination size="xs" total={totalPages} value={pagination.page} onChange={page => paginationState$.page.set(page)} withPages={false} />
			</div>
			<div className="flex items-center gap-2">
				<span className="text-xs text-stone-900">Rows per page:</span>
				<Select
					value={String(pagination.limit)}
					onChange={value => paginationState$.limit.set(Number(value))}
					data={ROW_LIMITS.map(limit => ({ label: String(limit), value: String(limit) }))}
					className="w-[75px] text-stone-800"
					disabled={pagination.total < ROW_LIMITS[0]!} // disable if total is less than the first limit
				/>
			</div>
		</div>
	);
}
