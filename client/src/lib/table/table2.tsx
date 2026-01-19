
import {
	type BeforeSaveDataDetails,
	type ColumnRegular,
	type DataType,
	type DimensionColPin,
	RevoGrid,
	Template,
} from '@revolist/react-datagrid';
import {
	AdvanceFilterPlugin,
	AutoFillPlugin,
	CellFlashPlugin,
	CellValidatePlugin,
	ColumnSelectionPlugin,
	editorCounter,
	editorSlider,
	EventManagerPlugin,
	ExportExcelPlugin,
	HistoryPlugin,
	RowAutoSizePlugin,
	RowHeaderPlugin,
	RowOrderPlugin,
} from '@revolist/revogrid-pro';
import React, {
	memo,
	useCallback,
	useEffect,
	useMemo,
	useRef,
} from 'react';
import { twJoin } from 'tailwind-merge';
import { z } from 'zod';

import AddColCell, { AddColHeader } from '~client/lib/table/cells/add-col-btn';
import { CellDisplay } from '~client/lib/table/cells/cell-display';
// import ColHeader from '~client/lib/table/cells/col-header';
import { usePreventRangeSelection } from '~client/lib/table/hooks/table-hooks';
import { AllProviders } from '~client/main';
import { useGetVisibleColumns } from '~client/utils/utils';

import { getColumnWidthByType, getSmartColumnWidth } from './utils/column-width';
import { CoyaxFieldTypes, RelationType } from '~client/utils/types';

export const COYAX_TABLE_ROW_HEIGHT = 36;
export const COYAX_TABLE_PINNED_ROW_HEIGHT = 100;
export type CoyaxTableType = 'json' | 'sql';
export type CoyaxTableSaveEvent = CustomEvent<ExtendedBeforeSaveDataDetails>;

const preferredColumnOrderForTable = {
	_document_metadata: [
		'id',
		'document_number',
		'document_type',
		'date',
		'totalItems',
		'status',
	],
	Sellers: ['id', 'name', 'email'],
	Buyers: ['id', 'name', 'email'],
	Items: ['id', 'description', 'quantity'],
};

interface CoyaxTableProps {
	hideAddColumn?: boolean
	hideIdColumn?: boolean
	hideColumns?: string[]
	tableName: string
	data: any[]
	columns: string[]
	type?: CoyaxTableType
	onSave?: (e: CoyaxTableSaveEvent) => void
	afterSave?: (e: CoyaxTableSaveEvent) => void
	options?: {
		showBottomRow?: boolean
	}
	groupBy?: string[]
	sqlSchema?: any
	viewId?: string
	readonly?: boolean
	selectionOnly?: boolean // Allow selection but prevent editing
	isParserView?: boolean
	job?: DocumentParserJob
	updateJobMutation?: any
	onRowClick?: (row: any) => void
	canDeleteColumns?: boolean
	canUpdateColumns?: boolean
	plugins?: any[]
	mergeCells?: string[]
	columnOrder?: string[]
	onColumnOrderChange?: (e: any) => void
	onRowOrderChange?: (e: any) => void
	validateColumns?: Record<string, boolean>
	afterValidateCol?: (e: any) => void
	hideOpenButton?: boolean
	pinnedColumns?: { start: string[], end: string[] }
}

interface ExtendedBeforeSaveDataDetails extends BeforeSaveDataDetails {
	custom?: boolean
}

/**
 * Higher-order component to wrap a component in AllProviders and memoize it
 * Note: Using MantineProvider slows down performance, but the table removes access
 * to the root provider so we need to create a new one here.
 */
export const withAllProviders = (Component: React.ComponentType<any>) => {
	const WrappedComponent = memo((props: any) => (
		<AllProviders>
			<Component {...props} />
		</AllProviders>
	));
	WrappedComponent.displayName = `WithAllProviders(${Component.displayName || Component.name || 'Component'})`;
	return WrappedComponent;
};

/**
 * Factory function to create stable CellDisplay template references
 * The key prop ensures templates don't get recreated on every render
 */
const makeCellDisplayTemplate = (
	columnName: string,
	readonly: boolean,
	tableName: string,
	sqlSchema: any,
	hideOpenButton = false,
) =>
	Template(withAllProviders(CellDisplay), {
		key: `${tableName}-${columnName}`,
		readonly,
		tableName,
		sqlSchema,
		hideOpenButton,
	});

/**
 * Factory function to create stable ColHeader template references
 */
// const makeColHeaderTemplate = (
// 	isParserView: boolean,
// 	job: DocumentParserJob | undefined,
// 	updateJobMutation: any,
// 	readonly: boolean,
// ) =>
// 	Template(withAllProviders(ColHeader), {
// 		key: `colheader-${isParserView ? 'parser' : 'regular'}`,
// 		isParserView,
// 		job,
// 		updateJobMutation,
// 		readonly,
// 	});

/* -------------------------------------------------------------------------- */
/*                                MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */
let count = 0;
function CoyaxTableV2({
	tableName,
	data,
	columns,
	type: _type,
	options,
	onSave,
	afterSave,
	hideAddColumn = false,
	hideIdColumn = false,
	hideColumns = [],
	sqlSchema,
	groupBy,
	viewId,
	readonly = false,
	selectionOnly = false,
	isParserView = false,
	job,
	updateJobMutation,
	canDeleteColumns = false,
	canUpdateColumns = false,
	onRowClick,
	plugins: customPlugins,
	mergeCells = [],
	columnOrder,
	onColumnOrderChange,
	onRowOrderChange,
	validateColumns,
	afterValidateCol,
	hideOpenButton,
	pinnedColumns,
}: CoyaxTableProps) {
	const gridRef = useRef<HTMLRevoGridElement>(null);
	usePreventRangeSelection(gridRef);

	const opts = options || { showBottomRow: true };


	/* ---------------------------- Event Listeners Setup --------------------------- */
	useEffect(() => {
		const grid = gridRef.current;
		if (!grid) return;

		// Before undo handler
		const handleBeforeUndo = (e: CustomEvent<any>) => {
			const dataKeys = Object.keys(e.detail.data || {});
			const firstKey = dataKeys[0];
			const rowIndex
				= firstKey !== undefined ? parseInt(firstKey, 10) : undefined;

			if (rowIndex !== undefined) {
				const rowData = e.detail.data[rowIndex];
				const firstKey = Object.keys(rowData || {})[0] as string | undefined;
				if (firstKey) {
					const transformedEvent = {
						...e,
						detail: {
							...e.detail,
							rowIndex: rowIndex,
							column: { columnName: firstKey },
							val: rowData[firstKey],
						},
					};
					onSave?.(transformedEvent);
				} else {
					console.error('Could not extract columnName from event data');
				}
			} else {
				console.error('Could not extract rowIndex from event data');
			}
		};

		// After undo handler
		const handleAfterUndo = (e: CustomEvent<any>) => {
			afterSave?.(e);
		};

		// Attach event listeners
		grid.addEventListener('beforeundo', handleBeforeUndo as EventListener);
		grid.addEventListener('afterundo', handleAfterUndo as EventListener);

		if (onColumnOrderChange) {
			grid.addEventListener(
				'beforecolumndragend',
				onColumnOrderChange as EventListener,
			);
		}

		if (onRowOrderChange) {
			grid.addEventListener('rowdropped', onRowOrderChange as EventListener);
		}

		if (afterValidateCol) {
			grid.addEventListener(
				'aftervalidatecol',
				afterValidateCol as EventListener,
			);
		}

		// Cleanup
		return () => {
			grid.removeEventListener('beforeundo', handleBeforeUndo as EventListener);
			grid.removeEventListener('afterundo', handleAfterUndo as EventListener);

			if (onColumnOrderChange) {
				grid.removeEventListener(
					'beforecolumndragend',
					onColumnOrderChange as EventListener,
				);
			}

			if (onRowOrderChange) {
				grid.removeEventListener(
					'rowdropped',
					onRowOrderChange as EventListener,
				);
			}

			if (afterValidateCol) {
				grid.removeEventListener(
					'aftervalidatecol',
					afterValidateCol as EventListener,
				);
			}
		};
	}, [
		onSave,
		afterSave,
		onColumnOrderChange,
		onRowOrderChange,
		afterValidateCol,
	]);

	/* ---------------------------- Plugins Setup ---------------------------- */
	const plugins = useMemo(() => {
		if (isParserView) {
			// Parser tables: NO plugins at all
			return [];
		}
		if (customPlugins) {
			// MDM tables: use passed plugins with RowAutoSizePlugin
			return [
				...customPlugins,
				RowHeaderPlugin,
				RowAutoSizePlugin,
			];
		}
		// Fallback plugins
		return [RowHeaderPlugin, RowAutoSizePlugin];
	}, [customPlugins, isParserView]);

	/* ---------------------------- Validation Helpers ---------------------------- */
	const numberValidate = useCallback((value: any) => {
		if (value === null || value === undefined || value === '') return true;
		return !isNaN(Number(value)) && typeof Number(value) === 'number';
	}, []);

	const urlValidate = useCallback((value: any) => {
		if (value === null || value === undefined || value === '') return true;
		const inputString = String(value).trim();

		// Try email validation first
		try {
			z.string().email().parse(inputString);
			return true;
		} catch {
			// Not an email, continue with URL/domain validation
		}

		// Try full URL validation (with protocol)
		try {
			z.string().url().parse(inputString);
			return true;
		} catch {
			// Not a full URL, try domain validation
		}

		// Domain validation - support domains with or without www
		const domainString = inputString.replace(/^www\./, '');
		const domainRegex
			= /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

		return domainRegex.test(domainString);
	}, []);

	/* ------------------------- Column Sorting & Filtering ------------------------ */
	const sortedColumns = useMemo(() => {
		let sorted: string[];
		if (Array.isArray(columnOrder) && columnOrder.length > 0) {
			// Start with columns from columnOrder that exist in the schema
			const orderedColumns = columnOrder.filter(col => columns.includes(col));

			// Find columns that exist in schema but aren't in columnOrder
			const missingColumns = columns.filter(
				col => !columnOrder.includes(col),
			);

			// Merge: ordered columns first (in columnOrder order), then missing columns
			sorted = [...orderedColumns, ...missingColumns];

			// Only move relationship columns to the end if they weren't explicitly ordered by the user
			// If a relationship column is in columnOrder, respect the user's placement
			const explicitlyOrdered = new Set(orderedColumns);
			const regularCols = sorted.filter(
				col =>
					(!col.endsWith('_rel') && !col.endsWith('_'))
					|| explicitlyOrdered.has(col),
			);
			const relationCols = sorted.filter(
				col =>
					(col.endsWith('_rel') || col.endsWith('_'))
					&& !explicitlyOrdered.has(col),
			);
			sorted = [...regularCols, ...relationCols];
		} else {
			sorted = [...columns].sort((a, b) => {
				const preferredOrder
					= preferredColumnOrderForTable[
					tableName as keyof typeof preferredColumnOrderForTable
					];
				if (!preferredOrder) return 0;

				const indexA = preferredOrder.indexOf(a);
				const indexB = preferredOrder.indexOf(b);

				if (indexA === -1 && indexB === -1) return 0;
				if (indexA === -1) return 1;
				if (indexB === -1) return -1;
				return indexA - indexB;
			});
		}

		return sorted;
	}, [columns, columnOrder, tableName]);

	/* ------------------------- Memoize Column Definitions ------------------------ */
	const revoCols: ColumnRegular[] = useMemo(() => {
		// const colHeaderTemplate = makeColHeaderTemplate(
		// 	isParserView,
		// 	job,
		// 	updateJobMutation,
		// 	readonly,
		// );

		const foreignKeyColumns
			= sqlSchema?.relations?.reduce((columns: string[], relation: any) => {
				if (
					relation.type === RelationType.OneToMany
					|| relation.type === RelationType.OneToOne
				) {
					columns.push(relation.foreignKey);
				}
				return columns;
			}, [] as string[]) || [];

		const filteredColumns = sortedColumns
			.filter((column) => {
				if (
					column === '_unresolved_relations'
					|| column === '_resolved_relations'
					|| column === 'Miscellaneous'
					|| column === '_action'
					|| column === 'row_order'
					|| column === 'comments_'
				) {
					return false;
				}

				// Hide foreign key columns
				if (foreignKeyColumns.includes(column)) {
					return false;
				}

				// Apply existing hideIdColumn and hideColumns logic
				if (hideIdColumn && column === 'id') {
					return false;
				}

				if (hideColumns.includes(column)) {
					return false;
				}

				return true;
			})
			.map((column): ColumnRegular => {
				const field
					= sqlSchema?.tables[
						tableName === '_document_metadata' ? 'documents' : tableName
					]?.fields[column];

				const isProgressType = field?.type === CoyaxFieldTypes.Progress;
				const isCounterType = field?.type === CoyaxFieldTypes.Counter;
				let cellDisplay = makeCellDisplayTemplate(column, false, tableName, sqlSchema)
				return {
					prop: column,
					name:
						field?.displayName
						// Format column name: replace underscores with spaces and capitalize first letter
						|| column
							.replace(/_/g, ' ')
							.replace(/\b\w/g, char => char.toUpperCase())
					,
					cellTemplate: cellDisplay,
					size:
						column === 'id' && !(groupBy?.length ?? 0 > 0)
							? 70
							: getSmartColumnWidth(
								field?.type || CoyaxFieldTypes.Text,
								column,
								data,
								groupBy,
							),
					editable: !readonly && !selectionOnly,
					min: isCounterType ? 0 : isProgressType ? 0 : undefined,
					max: isCounterType ? 100 : isProgressType ? 100 : undefined,
					step: isCounterType ? 1 : isProgressType ? 5 : undefined,
					flash: () => true,
					pin: (() => {
						// ID column is always pinned to start
						if (column === 'id') return 'colPinStart' as DimensionColPin;
						// Check pinned columns
						if (pinnedColumns) {
							if (pinnedColumns.start?.includes(column))
								return 'colPinStart' as DimensionColPin;
							if (pinnedColumns.end?.includes(column))
								return 'colPinEnd' as DimensionColPin;
						}
						return undefined;
					})(),
					tableName,
					columnName: column,
					sqlSchema: sqlSchema,
					viewId,
					readonly: column === 'id' ? readonly : readonly || selectionOnly, // Keep readonly false for ID column so checkbox works, prevent editing for others
					canDeleteColumns,
					canUpdateColumns,
					columns: sortedColumns,
					merge: mergeCells.includes(column),
					isParserView,
					hideOpenButton,
					validateColumn: validateColumns?.[column],
					...(!isParserView && column === 'id' && { rowDrag: true }),

					// Enhanced number validation
					...(field
						&& [CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(
							field.type,
						) && {
						validate: numberValidate,
					}),

					// Counter validation
					...(field?.type === CoyaxFieldTypes.Counter && {
						validate: numberValidate,
					}),

					// Progress validation
					...(field?.type === CoyaxFieldTypes.Progress && {
						validate: numberValidate,
					}),

					// URL validation
					...(field?.type === CoyaxFieldTypes.Url && {
						validate: urlValidate,
					}),

					// Filter types
					...(field
						&& [CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(
							field.type,
						) && {
						filter: ['number', 'slider'],
					}),

					...(field?.type === CoyaxFieldTypes.Date && {
						filter: ['date'],
					}),

					// Add custom data attribute for number fields
					...(field
						&& [CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(
							field.type,
						) && {
						cellProperties: () => ({
							'data-column-type': 'number',
							'class': twJoin(
								'cell-flash',
								validateColumns?.[column] !== undefined
								&& (validateColumns[column] ? 'bg-[#DDFFBB]' : 'bg-[#FFFF99]'),
							),
						}),
					}),
				};
			});

		// Add hidden grouping-only columns (derived keys) so RevoGrid can group on them
		const existingProps = new Set(filteredColumns.map(c => c.prop));
		const groupingOnlyColumns
			= (groupBy || [])
				.filter(col => !existingProps.has(col))
				.map(
					(col): ColumnRegular => ({
						prop: col,
						name: '',
						size: 1,
						editable: false,
						resizable: false,
						readonly: true,
						columnTemplate: Template(() => null),
						cellTemplate: Template(() => null),
						tableName,
						columnName: col,
						sqlSchema: sqlSchema,
						viewId,
					}),
				) || [];

		// Add column button at the end
		const addColumnCol
			= hideAddColumn || readonly || isParserView
				? []
				: [
					{
						prop: 'addColumn',
						name: '+',
						size: 50,
						pin: 'colPinEnd' as DimensionColPin,
						columnTemplate: Template(withAllProviders(AddColHeader)),
						tableName,
						sqlSchema: sqlSchema,
						viewId,
						columns: sortedColumns,
					},
				];

		return [...filteredColumns, ...groupingOnlyColumns, ...addColumnCol];
	}, [
		sortedColumns,
		hideIdColumn,
		hideColumns,
		sqlSchema,
		tableName,
		isParserView,
		job,
		updateJobMutation,
		readonly,
		groupBy,
		data,
		viewId,
		canDeleteColumns,
		canUpdateColumns,
		mergeCells,
		validateColumns,
		hideOpenButton,
		hideAddColumn,
		numberValidate,
		urlValidate,
		pinnedColumns,
	]);

	/* ------------------------- Pinned Bottom Data ------------------------- */
	const pinnedBottomData: DataType[] = useMemo(() => {
		return data.length > 0 && opts.showBottomRow
			? [
				{
					...Object.fromEntries(columns.map(col => [col, null])),
					addColumn: null,
					size: COYAX_TABLE_PINNED_ROW_HEIGHT,
					calc: data.length,
				},
			]
			: [];
	}, [data, opts.showBottomRow, columns]);

	/* ------------------------------ Event Handlers ------------------------------ */
	const handleBeforeCellFocus = useCallback(
		(e: CustomEvent<any>) => {
			if (
				readonly
				|| e.detail?.column?.prop === 'addColumn'
				|| e.detail?.type === 'rowPinEnd'
			) {
				e.preventDefault();
			}
		},
		[readonly],
	);

	const handleBeforeEdit = useCallback(
		(e: CustomEvent<ExtendedBeforeSaveDataDetails>) => {
			if (
				readonly
				|| selectionOnly
				|| (typeof e.detail.column?.validate === 'function'
					&& !e.detail.column.validate(e.detail.val))
			) {
				e.preventDefault();
				return;
			}
			onSave?.(e);
		},
		[readonly, selectionOnly, onSave],
	);

	const handleAfterEdit = useCallback(
		(e: CustomEvent<any>) => {
			if (readonly || selectionOnly) return;
			// Range edits emit a dedicated event; avoid double-calling afterSave
			if (e.detail?.newRange) {
				return;
			}
			afterSave?.(e);
		},
		[readonly, selectionOnly, afterSave],
	);

	useEffect(() => {
		const grid = gridRef.current;
		if (!grid || !afterSave || readonly || selectionOnly) return;

		const handleRangeApply = (event: Event) => {
			afterSave(event as CustomEvent<any>);
		};

		grid.addEventListener('rangeeditapply', handleRangeApply as EventListener);
		return () => {
			grid.removeEventListener(
				'rangeeditapply',
				handleRangeApply as EventListener,
			);
		};
	}, [readonly, afterSave]);

	const handleBeforeEditStart = useCallback((e: CustomEvent<any>) => {
		e.preventDefault();
		e.stopPropagation();
	}, []);

	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLRevoGridElement>) => {
			if (onRowClick) {
				const customEvent = event as unknown as CustomEvent<any>;
				onRowClick(data[customEvent.detail.row]);
			}
		},
		[onRowClick, data],
	);

	/* ------------------------------ Additional Data ------------------------------ */
	const additionalData = useMemo(
		() => ({
			eventManager: {
				applyEventsToSource: true,
			},
			rowAutoSize: {
				calculateHeight: (rowData: any, columns: any[]) => {
					const maxLines = columns.reduce((max, col) => {
						const raw = rowData[col.prop];
						if (raw === null || raw === undefined) {
							return max;
						}
						const content = raw.toString().trim();
						if (!content) {
							return max;
						}

						const lines = content.split('\n');
						const actualLineCount = lines.length;

						const charactersPerLine = 40;
						const wrappedLines = lines.reduce((total: number, line: string) => {
							if (line.length === 0) {
								return total + 1;
							}
							const wrappedLineCount = Math.ceil(
								line.length / charactersPerLine,
							);
							return total + Math.max(wrappedLineCount, 1);
						}, 0);

						const totalLines = Math.max(actualLineCount, wrappedLines);
						return Math.max(max, totalLines);
					}, 0);

					if (maxLines <= 1) {
						return 34;
					}

					const cappedLines = Math.min(maxLines, 2);
					const LINE_HEIGHT = 21.6;

					return Math.ceil(34 + (cappedLines - 1) * LINE_HEIGHT);
				},
			},
			filter: {},
		}),
		[],
	);

	/* ----------------------------- Core Render Output ---------------------------- */
	return (
		<div
			className="relative h-full w-full"
		>
			<RevoGrid
				ref={gridRef}
				columns={revoCols}
				source={data}
				pinnedBottomSource={pinnedBottomData}
				rowSize={COYAX_TABLE_ROW_HEIGHT}
				readonly={readonly} // Don't set readonly when selectionOnly is true, so range selection works
				range={!readonly} // Enable range when readonly is false (including when selectionOnly is true)
				canFocus={!readonly} // Allow focus even when selectionOnly is true (needed for keyboard events like Enter)
				canMoveColumns={!readonly && !selectionOnly}
				onBeforecellfocus={handleBeforeCellFocus}
				onBeforeedit={handleBeforeEdit}
				onAfteredit={handleAfterEdit}
				onBeforeeditstart={handleBeforeEditStart}
				onClick={handleClick}
				grouping={groupBy ? { props: groupBy, expandedAll: true } : undefined}
				additionalData={additionalData}
				plugins={plugins}
			/>
		</div>
	);
}

export default CoyaxTableV2;
