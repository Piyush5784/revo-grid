import { observer, use$ } from "@legendapp/state/react";
import { Checkbox } from "@mantine/core";
import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { memo } from "react";

import { rowSelection$ } from "~client/lib/table/toolbar/top-toolbar";

export const CellID = observer(
  (props: ColumnTemplateProp | ColumnDataSchemaModel) => {
    const id = props.value.toString();
    const tableName: string = props.column.tableName;
    const isSelected = use$(() => rowSelection$.isSelected(tableName, id));
    const readOnly = (props as any).readOnly || false;

    const handleCheckboxChange = (value: boolean) => {
      if (value) {
        rowSelection$.addId(tableName, id);
      } else {
        // When unchecking, we need to delete the key entirely
        rowSelection$.removeId(tableName, id);
      }
    };

    return (
      <div className="flex size-full items-center justify-center px-3">
        <Checkbox
          color="stone.8"
          checked={isSelected}
          disabled={readOnly}
          size="xs"
          classNames={{
            root: "!m-0",
            body: "!m-0",
            input: "!m-0",
            inner: "!m-0",
          }}
          onChange={(value) => {
            handleCheckboxChange(value.target.checked);
          }}
        />
      </div>
    );
  }
);

export default memo(CellID);
