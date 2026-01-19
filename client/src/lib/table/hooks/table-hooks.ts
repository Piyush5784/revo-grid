import type { FocusRenderEvent } from '@revolist/react-datagrid';
import { useEffect } from 'react';

/**
 * Prevents the last "add column" column from being selected when the range selection is applied
 * @param gridRef - The ref to the grid element
 */
export function usePreventRangeSelection(gridRef: React.RefObject<HTMLRevoGridElement | null>) {
	useEffect(() => {
		const grid = gridRef?.current;
		if (!grid) return;

		const handleBeforeApplyRange = (e: CustomEvent) => {
			const revoEvent = e.detail as FocusRenderEvent;
			if (e.detail.custom) return;

			const rangeIncludesLastColumn = revoEvent.range.x1 === revoEvent.colDimension.count - 1;

			if (rangeIncludesLastColumn) {
				e.preventDefault();

				const newRange = {
					...revoEvent.range,
					x1: revoEvent.range.x1 - 1,
				};

				const newEvent = new CustomEvent('beforeapplyrange', {
					detail: {
						...revoEvent,
						range: newRange,
						custom: true, // used to avoid infinite loop and the event this calls
					},
					bubbles: true,
					cancelable: false,
					composed: false,
				});
				grid.dispatchEvent(newEvent);
			}
		};

		grid.addEventListener('beforeapplyrange', handleBeforeApplyRange);
		return () => {
			grid.removeEventListener('beforeapplyrange', handleBeforeApplyRange);
		};
	}, [gridRef]);
}

/**
 * Hook to handle the Enter key pressed event for a specific cell
 * @param colIndex - The column index of the cell
 * @param rowIndex - The row index of the cell
 * @param callback - The callback function to be called when the Enter key is pressed
 */
export const useEnterKeyPressed = (
	colIndex: number | undefined,
	rowIndex: number | undefined,
	callback: (event?: KeyboardEvent) => void,
) => {
	useEffect(() => {
		const handleGlobalKeyDown = (e: KeyboardEvent) => {
			const target = e.target as HTMLElement;

			if (
				e.key === 'Enter'
				&& target.getAttribute('data-rgcol') === colIndex?.toString()
				&& target.getAttribute('data-rgrow') === rowIndex?.toString()
			) {
				callback(e);
			}
		};

		window.addEventListener('keydown', handleGlobalKeyDown);
		return () => {
			window.removeEventListener('keydown', handleGlobalKeyDown);
		};
	}, [colIndex, rowIndex, callback]);
};
