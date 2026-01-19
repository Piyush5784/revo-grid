import { Checkbox } from "@mantine/core";
import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { useCallback, useRef } from "react";

// import { useCellEditing } from "~client/lib/table/hooks/cell-editor";
import { saveCellValue } from "~client/lib/table/hooks/table-events";

function CellBoolean(props: ColumnTemplateProp | ColumnDataSchemaModel) {
  const targetRef = useRef<HTMLDivElement>(null);

  // const { readonly, handleMouseDown } = useCellEditing(props);

  // Initialize value to false if null/undefined
  const currentValue =
    props.value === null || props.value === undefined
      ? false
      : Boolean(props.value);

  // Toggle function
  const handleToggle = useCallback(
    (checked: boolean) => {
      if (readonly) return;

      try {
        saveCellValue(props, targetRef, checked);
      } catch (error) {
        console.error("Error updating boolean value:", error);
      }
    },
    [readonly, props]
  );

  // Handle cell click - toggle the value
  const handleCellClick = useCallback(
    (e: React.MouseEvent) => {
      if ((e.target as HTMLElement).closest("input[type='checkbox']")) {
        return;
      }

      if (readonly) return;
      e.stopPropagation();
      handleToggle(!currentValue);
    },
    [readonly, currentValue, handleToggle]
  );

  return (
    <div
      ref={targetRef}
      className="flex size-full cursor-pointer items-center justify-center px-3"
      onMouseDown={handleMouseDown}
      onClick={handleCellClick}
      tabIndex={0}
    >
      <Checkbox
        checked={currentValue}
        onChange={(event) => handleToggle(event.currentTarget.checked)}
        disabled={readonly}
        color="stone.7"
        size="xs"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}

export default CellBoolean;
