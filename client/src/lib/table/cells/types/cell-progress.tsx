import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { Slider } from "@mantine/core";
import { useCallback, useEffect, useRef, useState } from "react";

// import { useCellEditing } from "~client/lib/table/hooks/cell-editor";
import { saveCellValue } from "~client/lib/table/hooks/table-events";

// Constants
const MIN_VALUE = 0;
const MAX_VALUE = 100;
const STEP = 5;

// Round to nearest multiple of 5
const roundToStep = (value: number): number => {
  return Math.round(value / STEP) * STEP;
};

function CellProgress(props: ColumnTemplateProp | ColumnDataSchemaModel) {
  const { readonly, handleMouseDown } = useCellEditing(props);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState<number>(0);

  // Get numeric value from props (0-100), rounded to step
  const getNumericValue = useCallback(() => {
    if (props.value == null) return 0;
    const num = Number(props.value);
    if (isNaN(num)) return 0;
    // Clamp between 0 and 100 and round to step
    const clamped = Math.max(MIN_VALUE, Math.min(MAX_VALUE, num));
    return roundToStep(clamped);
  }, [props.value]);

  const displayValue = getNumericValue();
  // Use localValue when dragging, otherwise use displayValue
  const percentage = isDragging ? localValue : displayValue;

  // Initialize local value from props
  useEffect(() => {
    setLocalValue(displayValue);
  }, [displayValue]);

  // Get progress bar color based on percentage
  const getProgressColor = useCallback((percent: number) => {
    if (percent <= 25) return "#eb690fcc"; // Red (includes 25)
    if (percent < 75) return "#f9be06c9"; // Yellow
    return "#2fb560ab"; // Green
  }, []);

  // Get progress bar color class for Mantine
  const getProgressColorClass = useCallback((percent: number) => {
    if (percent <= 25) return "bg-[#eb690fcc]"; // Red (includes 25)
    if (percent < 75) return "bg-[#f9be06c9]"; // Yellow
    return "bg-[#2fb560ab]"; // Green
  }, []);

  // Handle slider change - only update local state, don't save
  const handleSliderChange = useCallback(
    (value: number) => {
      if (readonly) return;
      const newValue = roundToStep(value);
      setLocalValue(newValue);
    },
    [readonly]
  );

  // Handle slider drag start
  const handleSliderDragStart = useCallback(() => {
    if (readonly) return;
    setIsDragging(true);
  }, [readonly]);

  // Handle slider drag end - save the value only when user releases
  const handleSliderDragEnd = useCallback(
    (value: number) => {
      if (readonly || !containerRef.current) {
        setIsDragging(false);
        return;
      }

      const newValue = roundToStep(value);
      setLocalValue(newValue);
      setIsDragging(false);

      // Save only when user releases the slider
      saveCellValue(props, containerRef, newValue);
    },
    [readonly, props]
  );

  // Stop propagation for slider events
  const stopPropagation = useCallback((e: React.SyntheticEvent) => {
    e.stopPropagation();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative size-full min-h-[36px] w-full max-w-full overflow-hidden overflow-x-hidden"
      onMouseDown={handleMouseDown}
      tabIndex={0}
    >
      <div className="flex size-full items-center gap-2 px-3">
        {/* Progress bar display with Mantine Slider */}
        <div className="flex-1 relative">
          <Slider
            value={localValue}
            onChange={handleSliderChange}
            onChangeEnd={handleSliderDragEnd}
            onMouseDown={handleSliderDragStart}
            min={MIN_VALUE}
            max={MAX_VALUE}
            step={STEP}
            disabled={readonly}
            size="xs"
            label={null}
            showLabelOnHover={false}
            classNames={{
              root: "h-1.5",
              track: "h-1.5 bg-stone-200",
              bar: `h-1.5 ${getProgressColorClass(localValue)}`,
              thumb: "w-3 h-3 border-2 border-stone-600 bg-white shadow-md",
            }}
            styles={{
              root: {
                padding: "6px 0",
              },
              track: {
                backgroundColor: "#e7e5e4",
              },
              bar: {
                backgroundColor: getProgressColor(localValue),
              },
              thumb: {
                borderColor: "#78716c",
                cursor: isDragging ? "grabbing" : "grab",
              },
              label: {
                display: "none",
              },
            }}
            onClick={stopPropagation}
            onMouseDownCapture={stopPropagation}
          />
        </div>

        {/* Percentage text */}
        <span className="text-xs font-medium text-stone-600 min-w-[35px] text-right">
          {percentage}%
        </span>
      </div>
    </div>
  );
}

export default CellProgress;
