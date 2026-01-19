import type { ColumnDataSchemaModel, ColumnTemplateProp } from '@revolist/react-datagrid';

function CellImage(props: ColumnTemplateProp | ColumnDataSchemaModel) {
	return (
		<div className="flex size-full items-center justify-center p-1">
			<img src={props.value} alt="Image" className="size-10 h-full object-contain" />
		</div>
	);
}

export default CellImage;
