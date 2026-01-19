import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";

import { createAfterEditEventV2 } from "~client/lib/table/hooks/table-events";
import { useEnterKeyPressed } from "~client/lib/table/hooks/table-hooks";

function CellNumber(props: ColumnTemplateProp | ColumnDataSchemaModel) {
  // Display value - preserve original format, avoid exponential notation
  const getDisplayValue = useCallback(() => {
    if (props.value == null) return "";

    // If it's already a string, use it directly (preserves original format)
    if (typeof props.value === "string") {
      return props.value;
    }

    // If it's a number, convert to string without exponential notation
    const num = Number(props.value);
    if (isNaN(num)) return "";

    // Use toLocaleString with maximumFractionDigits to avoid exponential notation
    // This preserves the number format as the user would expect
    try {
      // For integers, use simple toString
      if (Number.isInteger(num)) {
        return num.toString();
      }

      // For decimals, convert to string and remove unnecessary trailing zeros
      const str = num.toString();
      // If it's already in a good format (not exponential), use it
      if (!str.includes("e") && !str.includes("E")) {
        return str;
      }

      // If it's in exponential notation, convert it back to regular format
      // Use toFixed with enough precision, then remove trailing zeros
      const fixed = num.toFixed(20);
      return fixed.replace(/\.?0+$/, "");
    } catch {
      // Fallback to string conversion
      return String(props.value);
    }
  }, [props.value]);

  const displayValue = getDisplayValue();
  const readonly = props.column.readonly;
  const isValidated = props.column.validateColumn !== undefined;
  const isValid = isValidated ? props.column.validateColumn : true;
  const contentRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pendingPasteValueRef = useRef<string | null>(null);
  const skipEnterRef = useRef<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);
  const minHeight = 36;
  const PORTAL_EXPANSION_PX = 2;

  // Validate and sanitize numeric input
  const sanitizeNumericInput = useCallback((input: string): string => {
    // Allow: digits, single decimal point, negative sign at start
    // Remove all non-numeric characters except decimal and negative
    let sanitized = input.replace(/[^\d.-]/g, "");

    // Only allow one decimal point
    const parts = sanitized.split(".");
    if (parts.length > 2) {
      sanitized = parts[0] + "." + parts.slice(1).join("");
    }

    // Only allow negative sign at the beginning
    if (sanitized.includes("-")) {
      const negativeIndex = sanitized.indexOf("-");
      if (negativeIndex !== 0) {
        sanitized = sanitized.replace(/-/g, "");
      } else {
        // Keep only the first negative sign
        sanitized = "-" + sanitized.replace(/-/g, "");
      }
    }

    return sanitized;
  }, []);

  // Transform value before saving - preserve string format
  const transformValue = useCallback((value: string) => {
    return value === "" ? null : value;
  }, []);

  // Custom keydown handler for numeric input validation
  const handleKeyDown = useCallback(
    (
      e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
    ): boolean => {
      // Allow: digits, decimal point, minus, backspace, delete, arrow keys, tab
      const allowedKeys = [
        "Backspace",
        "Delete",
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Tab",
        "Home",
        "End",
        "Enter", // Allow Enter to save the value
        "Escape", // Allow Escape to cancel editing
      ];

      if (allowedKeys.includes(e.key)) {
        return false; // Don't prevent default
      }

      // Allow Ctrl/Cmd combinations (for copy, paste, select all, etc.)
      if (e.ctrlKey || e.metaKey) {
        return false;
      }

      // Check if the key is a number, decimal, or minus
      const isNumeric = /[\d.-]/.test(e.key);
      if (!isNumeric) {
        e.preventDefault();
        return true; // Prevent default
      }

      return false;
    },
    []
  );

  // Custom paste handler with numeric validation
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      e.stopPropagation();
      e.preventDefault();

      const pastedText = e.clipboardData.getData("text");
      const input = e.currentTarget;

      if (!input || !pastedText) return;

      const start = input.selectionStart ?? 0;
      const end = input.selectionEnd ?? 0;
      const currentValue = input.value;

      // Insert pasted text at cursor position
      const newValue =
        currentValue.substring(0, start) +
        pastedText +
        currentValue.substring(end);

      // Sanitize the entire value
      const sanitized = sanitizeNumericInput(newValue);
      input.value = sanitized;

      // Update cursor position after paste
      setTimeout(() => {
        const newCursorPos = Math.min(
          start + sanitized.length - currentValue.length,
          sanitized.length
        );
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [sanitizeNumericInput]
  );

  // Calculate position immediately when opening editor
  const handleOpenEditor = useCallback(() => {
    if (readonly || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    setIsEditing(true);
  }, [readonly]);

  // Handle Enter key to open editor when not editing
  useEnterKeyPressed(props.colIndex, props.rowIndex, (event) => {
    if (readonly || isEditing) return;

    if (skipEnterRef.current) {
      skipEnterRef.current = false;
      if (event) {
        const target = event.target as HTMLElement;
        const arrowDownEvent = new KeyboardEvent("keydown", {
          key: "ArrowDown",
          code: "ArrowDown",
          keyCode: 40,
          which: 40,
          bubbles: true,
          cancelable: true,
        });
        target.dispatchEvent(arrowDownEvent);
      }
      return;
    }

    handleOpenEditor();
  });

  // Focus input when editing starts
  useEffect(() => {
    if (isEditing && position && inputRef.current && wrapperRef.current) {
      const inputElement = inputRef.current;
      const wrapperElement = wrapperRef.current;
      setTimeout(() => {
        if (!inputElement || !wrapperElement) return;

        const wrapperWidth = wrapperElement.offsetWidth;
        if (wrapperWidth === 0) {
          inputElement.style.width = `${position.width}px`;
          inputElement.style.maxWidth = `${position.width}px`;
        } else {
          inputElement.style.width = "100%";
          inputElement.style.maxWidth = "100%";
        }
        inputElement.style.minWidth = "0";
        inputElement.style.boxSizing = "border-box";

        if (pendingPasteValueRef.current !== null) {
          inputElement.value = sanitizeNumericInput(
            pendingPasteValueRef.current
          );
          pendingPasteValueRef.current = null;
        } else {
          inputElement.value = sanitizeNumericInput(displayValue);
        }

        inputElement.focus();
        inputElement.select();
      }, 0);
    }
  }, [displayValue, isEditing, position, sanitizeNumericInput]);

  // Update position on scroll/resize
  useEffect(() => {
    if (!isEditing || !position) return;

    const updatePosition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [isEditing, position]);

  useEffect(() => {
    if (!isEditing) {
      pendingPasteValueRef.current = null;
    }
  }, [isEditing]);

  useEffect(() => {
    if (readonly) {
      return;
    }

    const handleGlobalPaste = (event: ClipboardEvent) => {
      if (isEditing) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const targetCol = target?.getAttribute("data-rgcol");
      const targetRow = target?.getAttribute("data-rgrow");
      if (
        targetCol !== props.colIndex?.toString() ||
        targetRow !== props.rowIndex?.toString()
      ) {
        return;
      }

      event.stopPropagation();
      event.preventDefault();

      const pastedText = event.clipboardData?.getData("text") ?? "";
      if (!pastedText) {
        return;
      }

      pendingPasteValueRef.current = sanitizeNumericInput(pastedText);
      handleOpenEditor();
    };

    window.addEventListener("paste", handleGlobalPaste, true);
    return () => {
      window.removeEventListener("paste", handleGlobalPaste, true);
    };
  }, [
    handleOpenEditor,
    isEditing,
    props.colIndex,
    props.rowIndex,
    readonly,
    sanitizeNumericInput,
  ]);

  const handleSave = useCallback(() => {
    if (!inputRef.current || !containerRef.current) return;

    const rawValue = inputRef.current.value;
    const sanitized = sanitizeNumericInput(rawValue);
    const transformedValue = transformValue(sanitized);
    const currentValue = props.data[props.rowIndex][props.column.columnName];

    if (currentValue !== transformedValue) {
      props.data[props.rowIndex][props.column.columnName] = transformedValue;
      const event = createAfterEditEventV2(props, transformedValue);
      containerRef.current.dispatchEvent(event);
    }

    setIsEditing(false);
    setPosition(null);
  }, [props, sanitizeNumericInput, transformValue]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeNumericInput(e.target.value);
      e.target.value = sanitized;
    },
    [sanitizeNumericInput]
  );

  const handleContainerPaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      if (readonly || isEditing) {
        return;
      }

      e.stopPropagation();
      e.preventDefault();

      const pastedText = e.clipboardData.getData("text");
      if (!pastedText) {
        return;
      }

      pendingPasteValueRef.current = sanitizeNumericInput(pastedText);
      handleOpenEditor();
    },
    [handleOpenEditor, isEditing, readonly, sanitizeNumericInput]
  );

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isEditing) {
        e.stopPropagation();
      }
    },
    [isEditing]
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      if (readonly) return;
      e.stopPropagation();
      handleOpenEditor();
    },
    [handleOpenEditor, readonly]
  );

  const handleBlur = () => {
    setIsEditing(false);
    setPosition(null);
  };

  // Detect if cell height indicates multi-line (based on row height)
  useEffect(() => {
    if (!containerRef.current || isEditing) {
      setIsMultiLine(false);
      return;
    }

    const checkMultiLine = () => {
      const container = containerRef.current;
      if (!container) return;

      // Check the container (cell) height
      // Single line cells are typically around 36px (min-h-[36px])
      // Multi-line cells (2 lines) are around 55-56px based on rowAutoSize calculation
      const cellHeight = container.offsetHeight;
      const singleLineMaxHeight = 45; // Threshold between single and multi-line
      
      setIsMultiLine(cellHeight > singleLineMaxHeight);
    };

    // Use setTimeout to ensure DOM is fully rendered
    const timeoutId = setTimeout(checkMultiLine, 0);

    const resizeObserver = new ResizeObserver(() => {
      setTimeout(checkMultiLine, 0);
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [displayValue, isEditing]);

  return (
    <>
      <div
        ref={containerRef}
        className={twJoin(
          "relative size-full min-h-[36px] w-full max-w-full overflow-hidden overflow-x-hidden",
          isValidated && (isValid ? "bg-[#DDFFBB]" : "bg-[#FFFF99]")
        )}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onClick={() => !readonly && handleOpenEditor()}
        onPaste={handleContainerPaste}
        tabIndex={0}
        data-rgcol={props.colIndex}
        data-rgrow={props.rowIndex}
      >
        {isEditing ? (
          <div className="invisible h-0 overflow-hidden pointer-events-none">
            {displayValue || " "}
          </div>
        ) : (
          <div
            ref={contentRef}
            className={twJoin(
              "h-full w-full max-w-full px-3 text-xs font-medium cursor-text overflow-hidden overflow-x-hidden flex items-start justify-end text-right pb-1.5",
              isMultiLine ? "pt-[11px]" : "pt-2.5"
            )}
          >
            {displayValue || null}
          </div>
        )}
      </div>

      {isEditing && position &&
        createPortal(
          <div
            ref={wrapperRef}
            className="fixed z-[10000] bg-white overflow-hidden"
            style={{
              top: `${position.top - PORTAL_EXPANSION_PX}px`,
              left: `${position.left - PORTAL_EXPANSION_PX}px`,
              width: `${position.width + PORTAL_EXPANSION_PX}px`,
              maxWidth: `${position.width + PORTAL_EXPANSION_PX}px`,
              minWidth: `${position.width + PORTAL_EXPANSION_PX}px`,
              minHeight: `${position.height + PORTAL_EXPANSION_PX * 2}px`,
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <input
              ref={inputRef}
              defaultValue={displayValue}
              type="text"
              inputMode="decimal"
              onChange={handleChange}
              onBlur={handleBlur}
              onKeyDown={(e) => {
                if (handleKeyDown(e)) {
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSave();

                  skipEnterRef.current = true;

                  setTimeout(() => {
                    if (containerRef.current) {
                      inputRef.current?.blur();
                      containerRef.current.focus();

                      const arrowDownEvent = new KeyboardEvent("keydown", {
                        key: "ArrowDown",
                        code: "ArrowDown",
                        keyCode: 40,
                        which: 40,
                        bubbles: true,
                        cancelable: true,
                      });
                      containerRef.current.dispatchEvent(arrowDownEvent);
                      skipEnterRef.current = false;
                    } else {
                      skipEnterRef.current = false;
                    }
                  }, 0);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  setIsEditing(false);
                  setPosition(null);
                }
                e.stopPropagation();
              }}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPaste={handlePaste}
              className="block w-full max-w-full min-w-0 px-3 text-xs font-medium border-[0.5px] border-blue-700 text-black font-[inherit] outline-none overflow-hidden bg-white cursor-text select-text box-border m-0 h-full text-right"
              style={{
                minHeight: `${position.height + PORTAL_EXPANSION_PX * 2}px`,
              }}
            />
          </div>,
          document.body
        )}
    </>
  );
}

export default CellNumber;
