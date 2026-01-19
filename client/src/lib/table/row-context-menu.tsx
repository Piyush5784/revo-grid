// import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
// import { ArrowDown, ArrowUp, Trash2 } from 'lucide-react';
// import { toast } from 'sonner';

// type SqlUtils = {
// 	sql?: {
// 		queryTableView?: { invalidate: () => unknown }
// 		queryTableFast?: { invalidate: () => unknown }
// 	}
// };

// type DeleteRowsFn = (args: { tableName: string; ids: any[] }) => Promise<unknown>;
// type InsertRowRelativeFn = (args: {
// 	tableName: string;
// 	anchorRowId: string;
// 	placement: 'above' | 'below';
// 	groupColumns?: string[];
// 	initialData?: Record<string, any>;
// }) => Promise<unknown>;

// type RowCtxMenuState = {
// 	open: boolean;
// 	x: number;
// 	y: number;
// 	rowIndex: number;
// 	rowData: any;
// 	visibleSource: any[] | null;
// };

// export function useRowContextMenu(params: {
// 	gridRef: React.RefObject<any>;
// 	data: any[];
// 	tableName: string;
// 	viewId?: string;
// 	readonly?: boolean;
// 	selectionOnly?: boolean;
// 	isParserView?: boolean;
// 	groupBy?: string[];
// 	utils: SqlUtils;
// 	deleteRows: DeleteRowsFn;
// 	insertRowRelative: InsertRowRelativeFn;
// }) {
// 	const {
// 		gridRef,
// 		data,
// 		tableName,
// 		viewId,
// 		readonly = false,
// 		selectionOnly = false,
// 		isParserView = false,
// 		groupBy,
// 		utils,
// 		deleteRows,
// 		insertRowRelative,
// 	} = params;

// 	const menuRef = useRef<HTMLDivElement | null>(null);
// 	const [rowMenu, setRowMenu] = useState<RowCtxMenuState | null>(null);

// 	const isRealRow = useCallback((row: any) => {
// 		return row && row.id != null && row.row_order != null;
// 	}, []);

// 	const toRawGroupColumns = useCallback((cols?: string[]) => {
// 		return (cols || []).map((c) =>
// 			c.startsWith('__group__') ? c.slice('__group__'.length) : c,
// 		);
// 	}, []);

// 	const groupColumns = useMemo(
// 		() => toRawGroupColumns(groupBy),
// 		[groupBy, toRawGroupColumns],
// 	);

// 	const resolveMaybePromise = useCallback(async <T,>(v: any): Promise<T> => {
// 		return v && typeof v.then === 'function' ? await v : v;
// 	}, []);

// 	const getVisibleSourceSafe = useCallback(async (): Promise<any[] | null> => {
// 		const grid: any = gridRef.current;
// 		if (!grid?.getVisibleSource) return null;
// 		try {
// 			const res = await resolveMaybePromise<any[]>(grid.getVisibleSource());
// 			return Array.isArray(res) ? res : null;
// 		} catch {
// 			return null;
// 		}
// 	}, [gridRef, resolveMaybePromise]);

// 	const findGroupHeaderValue = useCallback(
// 		(gridData: any[], rowIndex: number, groupCol: string): any => {
// 			for (let i = rowIndex; i >= 0; i--) {
// 				const row = gridData[i];
// 				if (!row) continue;

// 				// Group header rows don't have id/row_order (not real data rows)
// 				if (!isRealRow(row)) {
// 					const groupKey = `__group__${groupCol}`;
// 					if (groupKey in row) {
// 						const groupValue = row[groupKey];
// 						if (groupValue === '(empty)') return null;
// 						return groupValue;
// 					}
// 				} else {
// 					break;
// 				}
// 			}
// 			return null;
// 		},
// 		[isRealRow],
// 	);

// 	const extractGroupValues = useCallback(
// 		(gridData: any[], rowIndex: number, groupCols: string[]) => {
// 			const values: Record<string, any> = {};
// 			for (const col of groupCols) {
// 				const groupValue = findGroupHeaderValue(gridData, rowIndex, col);
// 				if (groupValue !== null && groupValue !== undefined) {
// 					values[col] = groupValue;
// 				}
// 			}
// 			return values;
// 		},
// 		[findGroupHeaderValue],
// 	);

// 	const closeRowMenu = useCallback(() => setRowMenu(null), []);

// 	useEffect(() => {
// 		if (!rowMenu?.open) return;

// 		const onMouseDown = (e: MouseEvent) => {
// 			const t = e.target as Node | null;
// 			if (menuRef.current && t && menuRef.current.contains(t)) return;
// 			closeRowMenu();
// 		};
// 		const onKeyDown = (e: KeyboardEvent) => {
// 			if (e.key === 'Escape') closeRowMenu();
// 		};
// 		const onScroll = () => closeRowMenu();
// 		const onResize = () => closeRowMenu();

// 		window.addEventListener('mousedown', onMouseDown, true);
// 		window.addEventListener('keydown', onKeyDown, true);
// 		window.addEventListener('scroll', onScroll, true);
// 		window.addEventListener('resize', onResize, true);
// 		return () => {
// 			window.removeEventListener('mousedown', onMouseDown, true);
// 			window.removeEventListener('keydown', onKeyDown, true);
// 			window.removeEventListener('scroll', onScroll, true);
// 			window.removeEventListener('resize', onResize, true);
// 		};
// 	}, [closeRowMenu, rowMenu?.open]);

// 	const invalidateTableQueries = useCallback(async () => {
// 		if (viewId) {
// 			await (utils.sql?.queryTableView?.invalidate?.() as any);
// 		} else {
// 			await (utils.sql?.queryTableFast?.invalidate?.() as any);
// 		}
// 	}, [utils, viewId]);

// 	const onContextMenuCapture = useCallback(
// 		async (e: React.MouseEvent) => {
// 			if (readonly || selectionOnly || isParserView) return;

// 			const target = e.target as HTMLElement | null;
// 			const cellEl = target?.closest?.('[data-rgrow]') as HTMLElement | null;
// 			if (!cellEl) return;

// 			const rowIndexRaw = cellEl.getAttribute('data-rgrow');
// 			const rowIndex = rowIndexRaw ? parseInt(rowIndexRaw, 10) : NaN;
// 			if (!Number.isFinite(rowIndex) || rowIndex < 0) return;

// 			// Prevent native browser context menu
// 			e.preventDefault();
// 			e.stopPropagation();

// 			const visibleSource = await getVisibleSourceSafe();
// 			const rowData = (visibleSource && visibleSource[rowIndex]) ?? data[rowIndex];

// 			// Don't show menu for group header / synthetic rows
// 			if (!rowData || rowData.id == null) return;

// 			setRowMenu({
// 				open: true,
// 				x: e.clientX,
// 				y: e.clientY,
// 				rowIndex,
// 				rowData,
// 				visibleSource,
// 			});
// 		},
// 		[data, getVisibleSourceSafe, isParserView, readonly, selectionOnly],
// 	);

// 	const handleAddRowRelative = useCallback(
// 		async (placement: 'above' | 'below') => {
// 			const m = rowMenu;
// 			if (!m?.open) return;

// 			closeRowMenu();

// 			try {
// 				const rowIndex = m.rowIndex;
// 				const rowData = m.rowData;
// 				const visibleSource = m.visibleSource;

// 				const groupValues = visibleSource
// 					? extractGroupValues(visibleSource, rowIndex, groupColumns)
// 					: {};
// 				const effectiveInitialData: Record<string, any> = {};
// 				for (const col of groupColumns) {
// 					const v = groupValues[col] ?? rowData?.[col];
// 					if (v !== undefined && v !== null) effectiveInitialData[col] = v;
// 				}
// 				const hasInitialData = Object.keys(effectiveInitialData).length > 0;

// 				await insertRowRelative({
// 					tableName,
// 					anchorRowId: String(rowData.id),
// 					placement,
// 					groupColumns,
// 					initialData: hasInitialData ? effectiveInitialData : undefined,
// 				});
// 				toast.success(`Row added ${placement}`);
// 				await invalidateTableQueries();
// 			} catch (err) {
// 				toast.error(`Add row ${placement} failed`);
// 				console.error('insertRowRelative failed', err);
// 			}
// 		},
// 		[
// 			closeRowMenu,
// 			extractGroupValues,
// 			groupColumns,
// 			insertRowRelative,
// 			invalidateTableQueries,
// 			rowMenu,
// 			tableName,
// 		],
// 	);

// 	const handleDeleteRow = useCallback(async () => {
// 		const m = rowMenu;
// 		if (!m?.open) return;

// 		closeRowMenu();

// 		try {
// 			await deleteRows({ tableName, ids: [m.rowData.id] });
// 			toast.success('Row deleted');
// 			await invalidateTableQueries();
// 		} catch (err) {
// 			toast.error('Delete row failed');
// 			console.error('deleteRows failed', err);
// 		}
// 	}, [closeRowMenu, deleteRows, invalidateTableQueries, rowMenu, tableName]);

// 	const menu = rowMenu?.open ? (
// 		<div
// 			ref={menuRef}
// 			className="fixed z-[9999] min-w-[180px] overflow-hidden rounded-md border border-stone-200 bg-white shadow-lg"
// 			style={{ left: rowMenu.x, top: rowMenu.y }}
// 			onContextMenu={(e) => {
// 				e.preventDefault();
// 				e.stopPropagation();
// 			}}
// 		>
// 			<button
// 				type="button"
// 				className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-black hover:bg-stone-50"
// 				onClick={() => void handleAddRowRelative('above')}
// 			>
// 				<ArrowUp size={14} className="shrink-0" />
// 				Add row above
// 			</button>
// 			<button
// 				type="button"
// 				className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-black hover:bg-stone-50"
// 				onClick={() => void handleAddRowRelative('below')}
// 			>
// 				<ArrowDown size={14} className="shrink-0" />
// 				Add row below
// 			</button>
// 			<div className="h-px bg-stone-200" />
// 			<button
// 				type="button"
// 				className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
// 				onClick={() => void handleDeleteRow()}
// 			>
// 				<Trash2 size={14} className="shrink-0" />
// 				Delete row
// 			</button>
// 		</div>
// 	) : null;

// 	return { onContextMenuCapture, menu };
// }

