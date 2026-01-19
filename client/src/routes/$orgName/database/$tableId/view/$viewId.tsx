import { use$ } from '@legendapp/state/react';
import { Box } from '@mantine/core';
import {
	AdvanceFilterPlugin,
	AutoFillPlugin,
	CellFlashPlugin,
	CellValidatePlugin,
	ColumnSelectionPlugin,
	EventManagerPlugin,
	ExportExcelPlugin,
	FormulaPlugin,
	HistoryPlugin,
	RowAutoSizePlugin,
	RowKeyboardNextLineFocusPlugin,
	RowOrderPlugin,
	SameValueMergePlugin,
} from '@revolist/revogrid-pro';
import { createFileRoute } from '@tanstack/react-router';
import { useEffect, useMemo } from 'react';

import CoyaxLoader from '~client/lib/loaders/loader';
import TableFooter, { paginationState$ } from '~client/lib/table/footer';
import CoyaxTableV2 from '~client/lib/table/table2';
import TopToolbar, {
	tableSearchState,
} from '~client/lib/table/toolbar/top-toolbar';
import { FILTERED_FIELDS_FOR_DOCUMENTS } from '~client/utils/const';
import {
	getTableNameById,
	transformDataForGrouping,
	useSqlSchema,
	useView,
} from '~client/utils/utils';
import { sql_table_view, findMany } from '~client/utils/mock-data';

export const Route = createFileRoute(
	'/$orgName/database/$tableId/view/$viewId',
)({
	component: RouteComponent,
});

function RouteComponent() {
	const params = Route.useParams();
	const searchSnapshot = use$(tableSearchState);
	const pagination = use$(paginationState$);

	const sqlSchema = useSqlSchema();
	const tableName = getTableNameById(sqlSchema, params.tableId);
	const { view } = useView(params.viewId);

	const tableViews = findMany.data;

	// const defaultViewColumnOrder = useMemo(() => {
	// 	if (!tableViews || tableViews.length === 0) return [] as string[];
	// 	// const defaultView = tableViews.find(v => v.name === 'Default View');
	// 	// const selectedView = defaultView || tableViews[0];
	// 	const order = selectedView?.columnOrder;
	// 	return Array.isArray(order) && order.length > 0 ? order : [];
	// }, [tableViews]);


	// Mock table data - using hardcoded data from temp.ts (READ-ONLY)
	const rowList = sql_table_view.result.data;
	const isTableLoading = false;
	const totalRows = rowList.rows.length ?? 0;
	const isLoading = isTableLoading;

	// Minimal plugins for read-only view
	const mdmPlugins = useMemo(
		() => [
			FormulaPlugin,
			// RowOddPlugin,
			ColumnSelectionPlugin,
			AutoFillPlugin,
			HistoryPlugin,
			EventManagerPlugin,
			RowKeyboardNextLineFocusPlugin,
			CellFlashPlugin,
			CellValidatePlugin,
			RowAutoSizePlugin,
			AdvanceFilterPlugin,
			SameValueMergePlugin,
			ExportExcelPlugin,
			RowOrderPlugin,
		],
		[],
	);

	useEffect(() => {
		paginationState$.total.set(totalRows || 0);
	}, [totalRows]);

	// Parse pinned columns from view
	const pinnedColumns = useMemo(() => {
		if (!view?.pinnedColumns) return { start: [], end: [] };
		try {
			const parsed
				= typeof view.pinnedColumns === 'string'
					? JSON.parse(view.pinnedColumns)
					: view.pinnedColumns;
			return parsed || { start: [], end: [] };
		} catch {
			return { start: [], end: [] };
		}
	}, [view?.pinnedColumns]);

	// Transform data for grouping
	const groupedRows = useMemo(() => {
		if (!rowList?.rows || !sqlSchema) return [];
		const rows = [...(rowList.rows || [])];
		return transformDataForGrouping(
			rows,
			view?.group || [],
			sqlSchema,
			tableName,
		);
	}, [rowList?.rows, view?.group, sqlSchema, tableName]);

	// Use derived grouping keys
	const groupProps = useMemo(
		() => (view?.group || []).map(col => `__group__${col}`),
		[view?.group],
	);

	if (isLoading || !sqlSchema || !view || !rowList?.rows)
		return <CoyaxLoader />;

	const rows = [...(rowList?.rows || [])];
	const tableSchema = sqlSchema.tables[tableName];
	if (!tableSchema) return <CoyaxLoader />;

	let fieldNames = ['id', ...Object.keys(tableSchema.fields)];

	// Add relation fields
	for (const relation of sqlSchema.relations) {
		if (relation.source.table === tableName) {
			fieldNames.push(relation.source.as);
		} else if (relation.target.table === tableName) {
			fieldNames.push(relation.target.as);
		}
	}

	// Filter visible columns based on view.visibleColumns
	const visibleColumns = (() => {
		if (!view.visibleColumns) return [] as { name: string, enabled: boolean }[];
		try {
			let parsed: any
				= typeof view.visibleColumns === 'string'
					? JSON.parse(view.visibleColumns)
					: view.visibleColumns;
			if (typeof parsed === 'string') {
				try {
					parsed = JSON.parse(parsed);
				} catch {
					/* ignore */
				}
			}
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [] as { name: string, enabled: boolean }[];
		}
	})();

	const getCustomSortedFields = (fields: string[]): string[] => {
		// Filter out invisible columns
		const visibleFields = fields.filter((field) => {
			if (field === 'id') return true;
			if (visibleColumns.length === 0) return true;
			const visibleColumn = visibleColumns.find(col => col.name === field);
			if (!visibleColumn) return true;
			return visibleColumn.enabled;
		});

		// Separate regular fields and relation fields
		const regularFields = visibleFields.filter(
			f => !f.endsWith('_rel') && !f.endsWith('_'),
		);
		const relationFields = visibleFields.filter(
			f => f.endsWith('_rel') || f.endsWith('_'),
		);

		// Apply column order
		const orderedRegular = (() => {
			const order
				=  Array.isArray(view.columnOrder)
						? view.columnOrder
						: [];
			if (!order.length) return regularFields;
			const inOrder = order.filter(f => regularFields.includes(f));
			const notInOrder = regularFields.filter(f => !order.includes(f));
			return [...inOrder, ...notInOrder];
		})();

		if (tableName === 'documents') {
			const fieldOrder = [
				'id',
				'document_number',
				'document_type',
				'date',
				'item_count',
				'sellers',
				'customers',
				'created_at',
				'updated_at',
			];
			const hiddenColumns = FILTERED_FIELDS_FOR_DOCUMENTS;
			const filteredRegular = orderedRegular.filter(
				f => !hiddenColumns.includes(f),
			);
			const filteredRelations = relationFields.filter(
				f => !hiddenColumns.includes(f),
			);
			return [
				...filteredRegular
					.filter(f => fieldOrder.includes(f))
					.sort((a, b) => fieldOrder.indexOf(a) - fieldOrder.indexOf(b)),
				...filteredRegular.filter(f => !fieldOrder.includes(f)),
				...filteredRelations,
			];
		}

		return [
			'id',
			...orderedRegular.filter(f => f !== 'id'),
			...relationFields,
		];
	};

	fieldNames = getCustomSortedFields(fieldNames);

	return (
		<Box className="relative flex h-full min-h-0 flex-col">
			<Box
				style={{
					width: '100%',
					transition: 'width 0.2s ease-in-out',
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
				}}
				className="flex min-h-0 flex-col"
			>
				<TopToolbar
					tableId={params.tableId}
					tableName={tableName}
					viewId={params.viewId}
				/>
				<div className="min-h-0 flex-1 overflow-y-auto">
					<CoyaxTableV2
						data={groupedRows}
						columns={fieldNames}
						type="sql"
						tableName={tableName}
						sqlSchema={sqlSchema}
						groupBy={groupProps}
						columnOrder={view.columnOrder || []}
						viewId={params.viewId}
						hideAddColumn={true}
						hideColumns={['row_order']}
						readonly={true}
						canDeleteColumns={false}
						canUpdateColumns={false}
						plugins={mdmPlugins}
						pinnedColumns={pinnedColumns}
					/>
				</div>
				<TableFooter />
			</Box>
		</Box>
	);
}

export default RouteComponent;
