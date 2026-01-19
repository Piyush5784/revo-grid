import { ActionIcon } from "@mantine/core";
import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { useCallback, useRef } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

import { createAfterEditEventV2 } from "~client/lib/table/hooks/table-events";

function CellCounter(props: ColumnTemplateProp | ColumnDataSchemaModel) {
  const readonly = props.column.readonly;
  const value = props.value ?? 0;
  const numValue = Number(value) || 0;
  const min = props.column.min ?? 0;
  const max = props.column.max ?? 100;
  const step = props.column.step ?? 1;
  const containerRef = useRef<HTMLDivElement>(null);

  const updateValue = useCallback(
    (newValue: number) => {
      const clampedValue = Math.max(min, Math.min(max, newValue));
      const valueStr = String(clampedValue);
      
      if (containerRef.current) {
        const event = createAfterEditEventV2(props, valueStr);
        containerRef.current.dispatchEvent(event);
      }
    },
    [props, min, max]
  );

  const handleIncrement = useCallback(() => {
    if (readonly) return;
    updateValue(numValue + step);
  }, [numValue, step, readonly, updateValue]);

  const handleDecrement = useCallback(() => {
    if (readonly) return;
    updateValue(numValue - step);
  }, [numValue, step, readonly, updateValue]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (readonly) return;
      const inputValue = e.target.value;
      if (inputValue === "" || inputValue === "-") {
        updateValue(0);
        return;
      }
      const num = Number(inputValue);
      if (!isNaN(num)) {
        updateValue(num);
      }
    },
    [readonly, updateValue]
  );

  return (
    <div
      ref={containerRef}
      className="revo-counter flex h-full w-full items-center justify-center gap-1"
    >
      <ActionIcon
        size="xs"
        variant="subtle"
        onClick={handleDecrement}
        disabled={readonly || numValue <= min}
        aria-label="Decrement"
        className="text-stone-800"
      >
        <LuMinus size={10} />
      </ActionIcon>
      <input
        type="number"
        value={numValue}
        onChange={handleInputChange}
        min={min}
        max={max}
        step={step}
        readOnly={readonly}
        className="revo-counter-value h-5 min-w-[2.5rem] flex-1 border-0 bg-transparent text-center text-xs font-medium text-stone-700 focus:outline-none"
      />
      <ActionIcon
        size="xs"
        variant="subtle"
        onClick={handleIncrement}
        disabled={readonly || numValue >= max}
        aria-label="Increment"
        className="text-stone-800"
      >
        <LuPlus size={10} />
      </ActionIcon>
    </div>
  );
}

export default CellCounter;
