import { TextInput } from '@mantine/core';
import { type EditorType } from '@revolist/react-datagrid';
import { memo } from 'react';

const CellEditor = ({ value, save, close }: EditorType) => {
	return (
		<div className="size-full px-2">
			<TextInput
				height={38}
				className="size-full"
				classNames={{
					input: 'h-[38px] text-[13px]',
				}}
				variant="unstyled"
				size="xs"
				defaultValue={value as string}
				autoFocus
				onBlur={() => {
					close();
				}}
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						console.log('enter key pressed');
						save(e.currentTarget.value);
					}
				}}
				onClick={e => e.stopPropagation()}
			/>
		</div>
	);
};

export const CELL_EDITOR = 'Cell_Editor';
export default memo(CellEditor);
