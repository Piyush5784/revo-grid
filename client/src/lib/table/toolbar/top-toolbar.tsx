import { observable } from '@legendapp/state';
import { use$ } from '@legendapp/state/react';
import {
	ActionIcon,
	Box,
	Button,
	Divider,
	Modal,
	TextInput,
	Tooltip,
	Transition,
} from '@mantine/core';
import { useEffect, useState } from 'react';
import {
	LuDatabase,
	LuInfo,
	LuPlus,
	LuSearch,
	LuTrash,
	LuX,
} from 'react-icons/lu';

import { SIDEBAR_HEADER_HEIGHT } from '~client/lib/sidebar/sidebar';
import { paginationState$ } from '../footer';

// Add this new observable for row selection
// shaun TODO: check tableName -> tableId change
export const rowSelection$ = observable({
	selectedIds: {} as Record<string, Record<string, boolean>>,
	clear: () => {
		rowSelection$.selectedIds.set({});
	},
	isSelected: (tableId: string, id: string) => {
		return !!rowSelection$.selectedIds[tableId]?.[id]?.get();
	},
	addId: (tableId: string, id: string) => {
		const currentState = rowSelection$.selectedIds.peek();
		const currentTableState = currentState[tableId] || {};
		// Set the entire state at once with the new id included
		rowSelection$.selectedIds.set({
			...currentState,
			[tableId]: {
				...currentTableState,
				[id]: true,
			},
		});
	},
	removeId: (tableId: string, id: string) => {
		const currentState = rowSelection$.selectedIds.peek();
		const currentTableState = currentState[tableId] || {};
		// Set the entire state at once with the new id included
		rowSelection$.selectedIds.set({
			...currentState,
			[tableId]: {
				...currentTableState,
				[id]: false,
			},
		});
	},
});

export const TOP_TOOLBAR_ACTION_BUTTON_ICON_SIZE = 12;
export const TOP_TOOLBAR_ACTION_BUTTON_ICON_COLOR = '#292524'; // stone-800

export interface TopToolbarProps {
	children?: React.ReactNode
	tableName: string
	tableId: string
	viewId: string
}

export const tableSearchState = observable({ search: '' });

function TopToolbar({ children, tableId, tableName, viewId }: TopToolbarProps) {
	const selectedIds = use$(() => {
		const ids = rowSelection$.selectedIds[tableName]?.get() || {};
		const filteredIds = Object.keys(ids).reduce(
			(acc, key) => {
				if (ids[key]) {
					acc[key] = true;
				}
				return acc;
			},
			{} as Record<string, boolean>,
		);
		return filteredIds;
	});
	const pagination = use$(paginationState$);

	const [searchExpanded, setSearchExpanded] = useState(false);
	const searchSnapshot = use$(tableSearchState);


	useEffect(() => {
		rowSelection$.clear();
	}, []);


	

	return (
		<>
			<Box
				className="flex w-full items-center justify-between gap-3  bg-stone-50 px-3 py-1.5"
				h={SIDEBAR_HEADER_HEIGHT}
				mih={SIDEBAR_HEADER_HEIGHT}
			>
				
				{/* ... existing search section ... */}
				<div className="hidden items-center">
					<Transition
						mounted={searchExpanded}
						transition={{
							in: { opacity: 1, transform: 'translateX(0)' },
							out: { opacity: 0, transform: 'translateX(-20px)' },
							common: { transformOrigin: 'left' },
							transitionProperty: 'transform, opacity',
						}}
						duration={200}
						timingFunction="ease"
					>
						{styles => (
							<div style={styles}>
								<TextInput
									size="xs"
									placeholder="Search documents..."
									value={searchSnapshot.search}
									onChange={(event) => {
										tableSearchState.search.set(event.currentTarget.value);
									}}
									leftSectionPointerEvents="none"
									styles={{
										input: {
											'color': 'var(--mantine-color-blue-filled)',
											'borderColor': 'var(--mantine-color-blue-filled)',
											'&:focus': {
												borderColor: 'var(--mantine-color-blue-filled)',
											},
										},
									}}
									leftSection={(
										<LuSearch
											size={TOP_TOOLBAR_ACTION_BUTTON_ICON_SIZE}
											style={{ color: 'var(--mantine-color-blue-filled)' }}
										/>
									)}
									onBlur={() => setSearchExpanded(false)}
									autoFocus
								/>
							</div>
						)}
					</Transition>
				</div>
				{children}
			</Box>
		</>
	);
}

export default TopToolbar;
