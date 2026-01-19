import { Menu } from '@mantine/core';
import type {
	ColumnDataSchemaModel,
	ColumnTemplateProp,
} from '@revolist/react-datagrid';
import { memo, useState } from 'react';
import {
	type AggregationType,
	getAggregationLabel,
	getAggregationsByCategory,
} from '~client/lib/table/utils/aggregations';
import { CoyaxFieldTypes, type Template } from '~client/utils/types';

const RowCount = ({ count }: { count: number }) => (
	<div className="flex size-full items-center bg-stone-50 px-3">
		<p className="whitespace-nowrap text-[11px] font-[400] text-stone-700">
			<b>{count}</b> rows
		</p>
	</div>
);

const CellCalc = (props: ColumnTemplateProp | ColumnDataSchemaModel) => {
	const [menuOpened, setMenuOpened] = useState(false);

	const isIdColumn = props.colIndex === 0 && props.prop === 'id';

	const sqlSchema = props.column?.sqlSchema as unknown as Template;
	const tableName
		= props.column?.tableName === '_document_metadata'
			? 'documents'
			: props.column?.tableName;
	const columnName = props.column?.columnName || props.prop;
	const viewId = props.column?.viewId;



	
	// Get field type
	const tableSchema = sqlSchema?.tables?.[tableName];
	const field = tableSchema?.fields?.[columnName];

	// Check if this is a relationship column
	const relation = sqlSchema?.relations?.find(
		(r: any) => r.source.as === columnName || r.target.as === columnName,
	);

	// Determine field type - use Relationship type if it's a relation column
	const fieldType
		= field?.type ?? (relation ? CoyaxFieldTypes.Relationship : undefined);



	// Show row count for ID column
	if (isIdColumn) {
		return <RowCount count={props.model?.calc || 0} />;
	}

	// No viewId means we can't save aggregation preferences
	if (!viewId || !fieldType) {
		return (
			<div className="flex size-full items-center justify-end bg-stone-50 px-3">
				<p className="text-xs text-stone-400">-</p>
			</div>
		);
	}

	const groupedAggs = getAggregationsByCategory(fieldType);

	// No aggregation selected - show "+ Summarize" button
	return (
		<Menu
			opened={menuOpened}
			onClose={() => setMenuOpened(false)}
			position="top-start"
			width={150}
		>
			<Menu.Target>
				<div
					className=" flex size-full cursor-pointer items-center justify-end bg-stone-50/50 px-2"
					onClick={() => setMenuOpened(true)}
				>
					<p className="text-[11px] text-stone-400 hover:text-stone-700">
						+ Summarize
					</p>
				</div>
			</Menu.Target>
			<Menu.Dropdown>
				{Object.entries(groupedAggs).map(([category, aggs]) => {
					if (aggs.length === 0) return null;
					return (
						<div key={category}>
							<Menu.Label className="text-[10px] text-stone-400">
								{category}
							</Menu.Label>
							{aggs.map((aggType: AggregationType) => (
								<Menu.Item
									key={aggType}
								>
									<span className="text-[12px]">
										{getAggregationLabel(aggType)}
									</span>
								</Menu.Item>
							))}
						</div>
					);
				})}
			</Menu.Dropdown>
		</Menu>
	);
};

export default memo(CellCalc);
