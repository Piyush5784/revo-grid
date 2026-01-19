import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { twJoin } from "tailwind-merge";
import { z } from "zod";

import { createAfterEditEventV2 } from "~client/lib/table/hooks/table-events";
import { useEnterKeyPressed } from "~client/lib/table/hooks/table-hooks";

// Format URL helper function - adds https:// if missing, preserves user's www choice
const formatUrl = (value: string): string => {
  const trimmedValue = String(value || "").trim();

  if (!trimmedValue) return "";

  // If it's an email, extract domain and create web URL
  if (trimmedValue.includes("@") && !trimmedValue.includes("://")) {
    const domain = trimmedValue.split("@")[1];
    return `https://${domain}`;
  }

  // If it already has a protocol, use as is
  if (trimmedValue.match(/^https?:\/\//)) {
    return trimmedValue;
  }

  // If it starts with www., add https:// (preserve user's www choice)
  if (trimmedValue.match(/^www\./)) {
    return `https://${trimmedValue}`;
  }

  // For plain domains, add https:// but don't force www
  return `https://${trimmedValue}`;
};

// Strip protocol and www for display
const stripUrlForDisplay = (value: string): string => {
  if (!value) return "";
  let cleaned = value.trim();

  // Remove protocol
  cleaned = cleaned.replace(/^https?:\/\//, "");

  // Remove www. prefix
  cleaned = cleaned.replace(/^www\./, "");

  return cleaned;
};

// Validate URL - same logic as table level validation
const validateUrl = (value: string): boolean => {
  if (value === null || value === undefined || value === "") return true;
  const inputString = String(value).trim();

  // Try email validation first
  try {
    z.string().email().parse(inputString);
    return true;
  } catch {
    // Not an email, continue with URL/domain validation
  }

  // Try full URL validation (with protocol)
  try {
    z.string().url().parse(inputString);
    return true;
  } catch {
    // Not a full URL, try domain validation
  }

  // Domain validation - support domains with or without www
  const domainString = inputString.replace(/^www\./, "");
  const domainRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

  return domainRegex.test(domainString);
};

function CellUrl(props: ColumnTemplateProp | ColumnDataSchemaModel) {
  const displayValue = (props.value as string) || "";
  const formattedUrl = formatUrl(displayValue);
  const displayText = stripUrlForDisplay(displayValue);
  const readonly = props.column.readonly;
  const [isValid, setIsValid] = useState<boolean>(true);
  const [showValidation, setShowValidation] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);
  const [inputValue, setInputValue] = useState(displayValue);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const skipEnterRef = useRef<boolean>(false);
  const minHeight = 36;
  const heightBuffer = 2;
  const PORTAL_EXPANSION_PX = 2;

  // Initialize validation state
  useEffect(() => {
    if (displayValue) {
      setIsValid(validateUrl(displayValue));
    } else {
      setIsValid(true); // Empty is valid
    }
  }, [displayValue]);

  // Validate value before saving
  const validateValue = useCallback((value: string): boolean => {
    if (!value.trim()) return true; // Empty is valid
    const valid = validateUrl(value);
    if (!valid) {
      // Show validation feedback
      setShowValidation(true);
      setIsValid(false);
      setTimeout(() => {
        setShowValidation(false);
      }, 1000);
    }
    return valid;
  }, []);

  useEffect(() => {
    // Show cleaned version (without protocol/www) in editor
    setInputValue(displayText);
  }, [displayText]);

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

  const resizeTextarea = useCallback(() => {
    if (!textareaRef.current || !wrapperRef.current) return;

    const textarea = textareaRef.current;
    textarea.style.height = "0px";
    const scrollHeight = textarea.scrollHeight;
    const newHeight =
      scrollHeight > minHeight ? scrollHeight + heightBuffer : minHeight;

    textarea.style.height = `${newHeight}px`;
    wrapperRef.current.style.height = `${newHeight}px`;
  }, [minHeight, heightBuffer]);

  const handleOpenEditor = useCallback(() => {
    if (readonly || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
    });
    // Show cleaned version (without protocol/www) in editor
    setInputValue(displayText);
    setIsEditing(true);
  }, [readonly, displayText]);

  useEffect(() => {
    if (isEditing && position && textareaRef.current && wrapperRef.current) {
      setTimeout(() => {
        const wrapperWidth = wrapperRef.current?.offsetWidth;
        if (wrapperWidth === 0) {
          textareaRef.current!.style.width = `${position.width}px`;
          textareaRef.current!.style.maxWidth = `${position.width}px`;
        } else {
          textareaRef.current!.style.width = "100%";
          textareaRef.current!.style.maxWidth = "100%";
        }
        textareaRef.current!.style.minWidth = "0";
        textareaRef.current!.style.boxSizing = "border-box";

        resizeTextarea();

        textareaRef.current?.focus();
        const len = textareaRef.current?.value.length || 0;
        textareaRef.current?.setSelectionRange(len, len);
      }, 0);
    }
  }, [isEditing, position, resizeTextarea]);

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

  const closeEditor = useCallback(() => {
    setIsEditing(false);
    setPosition(null);
    setShowValidation(false);
    setIsValid(true);
  }, []);

  const handleSave = useCallback(() => {
    if (!textareaRef.current || !containerRef.current) return;

    const rawValue = textareaRef.current.value.trim();

    // Empty value - save as empty
    if (!rawValue) {
      const currentValue = props.data[props.rowIndex][props.column.columnName];
      if (currentValue !== rawValue) {
        props.data[props.rowIndex][props.column.columnName] = rawValue;
        const event = createAfterEditEventV2(props, rawValue);
        containerRef.current.dispatchEvent(event);
      }
      closeEditor();
      return;
    }

    if (!validateValue(rawValue)) {
      textareaRef.current.focus();
      setInputValue(rawValue);
      return;
    }

    // Format URL before saving (add https:// if missing, preserve user's www choice)
    const formattedValue = formatUrl(rawValue);
    const currentValue = props.data[props.rowIndex][props.column.columnName];

    if (currentValue !== formattedValue) {
      props.data[props.rowIndex][props.column.columnName] = formattedValue;
      const event = createAfterEditEventV2(props, formattedValue);
      containerRef.current.dispatchEvent(event);
    }

    closeEditor();
  }, [closeEditor, props, validateValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    resizeTextarea();
  };

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.stopPropagation();
      e.preventDefault();

      if (!textareaRef.current) return;

      const pastedText = e.clipboardData.getData("text");
      if (!pastedText) return;

      const textarea = textareaRef.current;
      const start = textarea.selectionStart ?? 0;
      const end = textarea.selectionEnd ?? 0;
      const currentValue = textarea.value;

      const newValue =
        currentValue.substring(0, start) +
        pastedText +
        currentValue.substring(end);

      setInputValue(newValue);

      requestAnimationFrame(() => {
        if (!textareaRef.current) return;
        const cursorPos = start + pastedText.length;
        textareaRef.current.setSelectionRange(cursorPos, cursorPos);
        resizeTextarea();
      });
    },
    [resizeTextarea]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSave();

      if (!validateValue(textareaRef.current?.value || "")) {
        return;
      }

      skipEnterRef.current = true;

      setTimeout(() => {
        if (containerRef.current) {
          textareaRef.current?.blur();
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
      setIsEditing(false);
      setPosition(null);
      setShowValidation(false);
      setIsValid(true);
    }
    e.stopPropagation();
  };

  const TRUNCATE_LIMIT = 60;
  const truncatedDisplayValue = useMemo(() => {
    if (!displayText) return "";
    if (displayText.length <= TRUNCATE_LIMIT) {
      return displayText;
    }
    return `${displayText.slice(0, TRUNCATE_LIMIT - 1)}…`;
  }, [displayText]);

  return (
    <>
      <div
        ref={containerRef}
        className={twJoin(
          "relative size-full min-h-[36px] w-full max-w-full overflow-hidden px-3 pt-2.5 pb-1.5 transition-colors duration-200 flex items-start",
          showValidation &&
            (isValid ? "bg-[#FFFF99]" : "bg-red-200 animate-pulse")
        )}
        onDoubleClick={handleOpenEditor}
        onClick={(e) => {
          if (!displayText && !readonly) {
            handleOpenEditor();
            return;
          }
          if (readonly) {
            e.preventDefault();
          }
        }}
        tabIndex={0}
      >
        {isEditing ? (
          <div className="invisible h-0 overflow-hidden pointer-events-none">
            {displayText || " "}
          </div>
        ) : displayValue ? (
          <div className="w-full text-xs font-medium text-blue-600">
            <a
              href={formattedUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={displayText}
              className="block max-w-full leading-[1.4] break-all underline decoration-transparent hover:decoration-blue-600 focus:decoration-blue-600 transition-colors"
              onDoubleClick={(e) => {
                e.preventDefault();
                handleOpenEditor();
              }}
              onClick={(e) => {
                if (readonly) {
                  e.preventDefault();
                }
              }}
            >
              {truncatedDisplayValue}
            </a>
          </div>
        ) : null}
      </div>

      {isEditing &&
        position &&
        createPortal(
          <div
            ref={wrapperRef}
            className="fixed z-[10000] bg-white overflow-x-hidden overflow-y-visible h-auto"
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
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={closeEditor}
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPaste={handlePaste}
              className="block w-full max-w-full min-w-0 p-[6px_12px] text-xs font-medium leading-[1.8] border-[0.5px] border-blue-700 text-black font-[inherit] outline-none resize-none overflow-hidden overflow-x-hidden overflow-y-hidden bg-white cursor-text select-text box-border m-0 h-auto min-h-[36px] break-words whitespace-pre-wrap break-all"
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

export default CellUrl;
