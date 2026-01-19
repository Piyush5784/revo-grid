import type { ColumnDataSchemaModel, ColumnTemplateProp } from '@revolist/react-datagrid';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { createAfterEditEventV2 } from '../hooks/table-events';
import { useEnterKeyPressed } from '../hooks/table-hooks';
import { editingStore, getCellEditingKey } from './editing-store';

export function useCellEditing(
	props: ColumnTemplateProp | ColumnDataSchemaModel,
	skipEnterRef?: React.MutableRefObject<boolean>
) {
	const ref = useRef<HTMLTextAreaElement>(null);
	const readonly = props.column.readonly;
	const cellKey = useMemo(
		() => getCellEditingKey(props),
		[
			props.column?.columnName,
			props.column?.prop,
			props.column?.tableName,
			props.prop,
			props.rowIndex,
			(props.model as any)?.id,
		],
	);
	const [isEditing, setIsEditingState] = useState(
		() => editingStore.getState()?.key === cellKey,
	);

	// Track when we're actively setting editing state to prevent subscription race conditions
	const isSettingEditingRef = useRef(false);

	useEffect(() => {
		return editingStore.subscribe((state) => {
			// Ignore store updates if we're in the middle of setting editing state
			// This prevents race conditions where the subscription fires before
			// the store is updated, or when switching views causes stale state
			if (isSettingEditingRef.current) {
				return;
			}
			setIsEditingState(state?.key === cellKey);
		});
	}, [cellKey]);

	const setIsEditing = useCallback(
		(next: boolean) => {
			console.log("[useCellEditing] setIsEditing", { cellKey, next, stack: new Error().stack });
			
			// Set flag to prevent subscription from interfering
			isSettingEditingRef.current = true;
			
			// Update local state first
			setIsEditingState(next);
			
			// Then update store
			if (next) {
				const columnName = props.column?.columnName ?? props.prop ?? '';
				const rowData =
					props.rowIndex !== undefined ? props.data?.[props.rowIndex] : undefined;
				const currentValue =
					(rowData ? (rowData as any)[columnName as any] : undefined) ??
					ref.current?.value ??
					'';
				editingStore.setActive(cellKey, String(currentValue ?? ''));
			} else {
				editingStore.clear(cellKey);
			}
			
			// Allow subscription to work again after store update has propagated
			// Use a combination of requestAnimationFrame and setTimeout to ensure
			// the store update completes and subscription callbacks have fired
			requestAnimationFrame(() => {
				setTimeout(() => {
					const currentState = editingStore.getState();
					if (next && currentState?.key === cellKey) {
						// Store is correctly set, allow subscription to work
						isSettingEditingRef.current = false;
					} else if (!next && !currentState) {
						// Store is correctly cleared, allow subscription to work
						isSettingEditingRef.current = false;
					} else {
						// Store state doesn't match - this shouldn't happen, but
						// ensure we always reset the flag to prevent it getting stuck
						console.warn("[useCellEditing] Store state mismatch, resetting flag", {
							expected: next ? cellKey : null,
							actual: currentState
						});
						isSettingEditingRef.current = false;
					}
				}, 50);
			});
			
			// Fallback: Always reset the flag after a maximum delay to prevent it from getting stuck
			// This ensures the subscription can work even if something goes wrong
			setTimeout(() => {
				if (isSettingEditingRef.current) {
					console.warn("[useCellEditing] Flag was still set after 200ms, forcing reset", { cellKey, next });
					isSettingEditingRef.current = false;
				}
			}, 200);
		},
		[cellKey, props.column?.columnName, props.prop, props.data, props.rowIndex],
	);

	useEnterKeyPressed(props.colIndex, props.rowIndex, (event) => {
		// Skip if we just saved (to allow moving to next cell)
		if (skipEnterRef?.current) {
			skipEnterRef.current = false;
			// Dispatch ArrowDown to move to next cell instead of opening editor
			if (event) {
				const target = event.target as HTMLElement;
				const arrowDownEvent = new KeyboardEvent("keydown", {
					key: "ArrowDown",
					code: "ArrowDown",
					keyCode: 40,
					which: 40,
					bubbles: true,
					cancelable: true,
				});
				// Dispatch on the target element so the grid can handle it
				target.dispatchEvent(arrowDownEvent);
			}
			return;
		}
		setIsEditing(true);
		// Focus will be handled by the editor
		// Portal editor has its own focus logic in useEffect
		// Default editor will focus via ref.current?.focus() after render
		setTimeout(() => {
			ref.current?.focus();
		}, 0);
	});

	const handleDoubleClick = (e: React.MouseEvent) => {
		if (readonly) return;
		e.stopPropagation();
		setIsEditing(true);
		ref.current?.focus();
	};

	const handleBlur = () => {
		setIsEditing(false);
		handleChange();
	};

	const handleChange = () => {

		const currentValue = props.data[props.rowIndex][props.column.columnName];
		const newValue = ref.current?.value;



		if (currentValue !== newValue) {
			props.data[props.rowIndex][props.column.columnName] = newValue;
			ref.current?.dispatchEvent(createAfterEditEventV2(props, newValue));
		}
		ref.current?.blur();
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (isEditing) {
			e.stopPropagation();
			// Allow Shift+Enter for new lines, but Enter alone should save/blur
			if (["Enter", "Escape"].includes(e.key) && !e.shiftKey) {
				e.preventDefault();
				handleBlur();
			}
		}
	};

	const handleMouseDown = (e: React.MouseEvent) => {
		if (isEditing) {
			e.stopPropagation();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
		if (isEditing) {
			e.stopPropagation();
		}
	};

	return {
		ref,
		isEditing,
		setIsEditing,
		readonly,
		handleDoubleClick,
		handleBlur,
		handleKeyDown,
		handleMouseDown,
		handlePaste,
	};
}
