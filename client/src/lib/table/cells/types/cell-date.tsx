import { DatePickerInput, type DateValue } from "@mantine/dates";
import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { useEffect, useRef, useMemo, useState } from "react";
import { twJoin } from "tailwind-merge";

import { createAfterEditEventV2 } from "~client/lib/table/hooks/table-events";

function CellDate(props: ColumnTemplateProp | ColumnDataSchemaModel) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);

  // Parse date with validation
  const date = useMemo(() => {
    if (!props.value) return null;
    
    const valueString = String(props.value).trim();
    if (!valueString || valueString === 'null' || valueString === 'undefined') {
      return null;
    }
    
    let dateString = valueString;
    
    // If it's an ISO string, extract just the date part (YYYY-MM-DD)
    if (valueString.includes('T')) {
      dateString = valueString.split('T')[0]!;
    }
    
    // Check if it matches YYYY-MM-DD format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) {
      return null;
    }
    
    // Create Date object in local timezone to avoid timezone conversion issues
    const parts = dateString.split('-').map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) {
      return null;
    }
    const year = parts[0]!;
    const month = parts[1]!;
    const day = parts[2]!;
    const parsedDate = new Date(year, month - 1, day);
    
    // Validate it's not invalid
    if (isNaN(parsedDate.getTime())) {
      return null;
    }
    
    return parsedDate;
  }, [props.value]);

  const handleChange = (value: DateValue) => {
    // Regular Date column (single date)
    if (value) {
      const year = value.getFullYear();
      const month = String(value.getMonth() + 1).padStart(2, "0");
      const day = String(value.getDate()).padStart(2, "0");
      const dateString = `${year}-${month}-${day}`;

      props.data[props.rowIndex][props.column.columnName] = dateString;
      ref.current?.dispatchEvent(createAfterEditEventV2(props, dateString));
    } else {
      props.data[props.rowIndex][props.column.columnName] = null;
      ref.current?.dispatchEvent(createAfterEditEventV2(props, null));
    }
  };

  const handleCellClick = (e: React.MouseEvent) => {
    // If clicking on the container (not on the input or button), trigger click on the input or calendar button
    const target = e.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.closest('input');
    const isButton = target.tagName === 'BUTTON' || target.closest('button');
    
    if (!isInput && !isButton) {
      // Try to find and click the calendar button first (if it exists)
      const calendarButton = containerRef.current?.querySelector('button[type="button"]');
      if (calendarButton) {
        (calendarButton as HTMLButtonElement).click();
      } else {
        // Otherwise, click the input to open the calendar
        const input = containerRef.current?.querySelector('input');
        if (input) {
          input.click();
          input.focus();
        }
      }
    }
  };

  // Detect if content is multi-line
  useEffect(() => {
    if (!containerRef.current) return;

    const checkMultiLine = () => {
      const element = containerRef.current;
      if (!element) return;

      // Check if scrollHeight indicates multiple lines
      const scrollHeight = element.scrollHeight;
      const singleLineThreshold = 45;
      
      const newIsMultiLine = scrollHeight > singleLineThreshold;
      
      // Only update if value actually changed to prevent feedback loops
      setIsMultiLine(prev => {
        if (prev !== newIsMultiLine) {
          return newIsMultiLine;
        }
        return prev;
      });
    };

    checkMultiLine();

    const resizeObserver = new ResizeObserver(checkMultiLine);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [props.value]);

  // Regular Date column (single date)
  return (
    <div
      ref={containerRef}
      className={twJoin(
        "w-full h-full flex items-start cursor-pointer pb-1.5 px-3",
        isMultiLine ? "pt-[1px]" : "pt-0",
        props.column.validateColumn !== undefined &&
          (props.column.validateColumn ? "bg-[#DDFFBB]" : "bg-[#FFFF99]")
      )}
      onClick={handleCellClick}
    >
      <div ref={ref} className="w-full h-full">
        <DatePickerInput
          placeholder=""
          value={date}
          valueFormat="MMMM D, YYYY"
          classNames={{
            root: "w-full h-full flex items-start !pt-0",
            input:
              "border-none cursor-pointer text-[12px] font-medium placeholder:text-stone-400/70 placeholder:font-medium w-full !pt-0 !pb-0 !py-0 leading-none h-auto",
            wrapper: "h-auto flex items-start w-full !pt-0",
          }}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default CellDate;
