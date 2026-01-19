import { Pagination as MantinePagination, type PaginationProps } from '@mantine/core';

export function Pagination(props: PaginationProps) {
	return <MantinePagination size="sm" {...props} />;
}
