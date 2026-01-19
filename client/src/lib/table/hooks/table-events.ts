import type { ColumnDataSchemaModel, ColumnTemplateProp } from '@revolist/react-datagrid';

export const createAfterEditEventV2 = (props: ColumnTemplateProp | ColumnDataSchemaModel, newValue: any) => {
	// Create and dispatch the beforeedit event
	return new CustomEvent('afteredit', {
		bubbles: true,
		detail: {
			...props,
			// colIndex: props.colIndex,
			// colType: 'rgCol',
			// column: props.column,
			// data: props.data,
			// model: props.model,
			// prop: props.prop,
			// type: 'rgRow',
			// columnName: props.column.columnName,
			// tableName: props.column.tableName,
			// rowIndex: props.rowIndex,
			value: '',
			val: newValue,
		},
	});
};

export const createAfterAddRowEvent = (props: ColumnTemplateProp | ColumnDataSchemaModel, newValue: any) => {
	// Create and dispatch the beforeedit event
	return new CustomEvent('afteredit', {
		bubbles: true,
		detail: {
			...props,
			// colIndex: props.colIndex,
			// colType: 'rgCol',
			// column: props.column,
			// data: props.data,
			// model: props.model,
			// prop: props.prop,
			// type: 'rgRow',
			// columnName: props.column.columnName,
			// tableName: props.column.tableName,
			// rowIndex: props.rowIndex,
			value: '',
			val: newValue,
		},
	});
};

export const createAfterEditEvent = (props: ColumnTemplateProp | ColumnDataSchemaModel, newValue: any) => {
	// Create and dispatch the beforeedit event
	return new CustomEvent('afteredit', {
		bubbles: true,
		detail: {
			...props,
			detail: {
				colIndex: props.colIndex,
				colType: 'rgCol',
				column: props.column,
				data: props.data,

				model: props.model,
				prop: props.prop,
				type: 'rgRow',
				columnName: props.column.columnName,
				tableName: props.column.tableName,
				rowIndex: props.rowIndex,
				value: newValue,
				val: newValue,
			},
		},
	});
};

export const createAfterValidateColEvent = (props: any) => {
	return new CustomEvent('aftervalidatecol', {
		bubbles: true,
		detail: {
			...props,
		},
	});
};

/**
 * Helper function to save cell value and dispatch event
 * Used by cell components that don't use portal editing (boolean, progress, select, etc.)
 */
export const saveCellValue = <T extends HTMLElement = HTMLElement>(
	props: ColumnTemplateProp | ColumnDataSchemaModel,
	containerRef: React.RefObject<T | null>,
	newValue: any
): boolean => {
	if (
		!props.data ||
		props.rowIndex === undefined ||
		!props.column?.columnName
	) {
		return false;
	}

	const currentValue = props.data[props.rowIndex][props.column.columnName];

	if (currentValue !== newValue) {
		props.data[props.rowIndex][props.column.columnName] = newValue;
		const event = createAfterEditEventV2(props, newValue);
		containerRef.current?.dispatchEvent(event);
		return true;
	}

	return false;
};