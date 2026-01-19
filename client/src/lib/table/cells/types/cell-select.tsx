import { ActionIcon, Popover, TextInput } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { twJoin } from "tailwind-merge";
import { LuX } from "react-icons/lu";

import { Badge, BADGE_COLORS } from "~client/components/ui";
import { useCellEditing } from "~client/lib/table/hooks/cell-editor";
import { saveCellValue } from "~client/lib/table/hooks/table-events";
import { CoyaxFieldTypes, type Template } from "~client/utils/types";

type CellSelectProps =
  | ColumnTemplateProp
  | (ColumnDataSchemaModel & { isMultiSelect: boolean });

function CellSelect(props: CellSelectProps) {
  const [opened, { open, close }] = useDisclosure(false);
  const [inputValue, setInputValue] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    props.value || []
  );
  const targetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isMultiLine, setIsMultiLine] = useState(false);

  const { isEditing, setIsEditing, readonly, handleMouseDown } =
    useCellEditing(props);

  const inputRef = useRef<HTMLInputElement>(null);

  const sqlSchema = props.column.sqlSchema as unknown as Template | undefined;
  const normalizedTableName =
    props.column.tableName === "_document_metadata"
      ? "documents"
      : props.column.tableName;
  const fieldDefinition =
    normalizedTableName &&
    sqlSchema?.tables?.[normalizedTableName]?.fields?.[props.column.columnName];

  // Get tableId from sqlSchema
  const tableId = useMemo(() => {
    if (!sqlSchema || !normalizedTableName) return null;
    const table = sqlSchema.tables[normalizedTableName];
    return table?.id || null;
  }, [sqlSchema, normalizedTableName]);

  const schemaOptions = useMemo(() => {
    if (
      !fieldDefinition ||
      !(
        fieldDefinition.type === CoyaxFieldTypes.SingleSelect ||
        fieldDefinition.type === CoyaxFieldTypes.MultiSelect
      )
    ) {
      return [] as string[];
    }

  

    // For normal SingleSelect/MultiSelect, options are derived from data only
    // (see dataValues below)
    return [];
  }, [fieldDefinition, props.column.columnName]);

  // Get all unique values from rows of the column
  const values: string[] = useMemo(() => {
    const dataValues = props.data.reduce((acc: string[], curr: string) => {
      const value = curr[props.column.columnName];
      if (value) {
        const values = Array.isArray(value) ? value : [value];
        values.forEach((v) => {
          if (!acc.includes(v)) {
            acc.push(v);
          }
        });
      }
      return acc;
    }, [] as string[]);

    // Merge schema-defined options with data-derived values
    const combined = [...schemaOptions, ...dataValues];
    return [...new Set(combined)];
  }, [props.data, props.column.columnName, schemaOptions]);

  // Create consistent color mapping for each unique item
  const itemColorMap = useMemo(() => {
    const colorKeys = Object.keys(BADGE_COLORS);
    const colorMap: Record<string, string> = {};

    values.forEach((value, index) => {
      colorMap[value] = colorKeys[index % colorKeys.length] as string;
    });

    return colorMap;
  }, [values]);

  // Function to get color for a specific item
  const getItemColor = useCallback(
    (item: string) => {
      return itemColorMap[item] || "gray";
    },
    [itemColorMap]
  );

  // Filter options based on input value
  const options = useMemo(
    () =>
      values.filter((value) =>
        value.toLowerCase().includes(inputValue.toLowerCase())
      ),
    [values, inputValue]
  );

  // Sync selectedOptions with props.value
  useEffect(() => {
    setSelectedOptions(props.value || []);
  }, [props.value]);

  // Handle opening the popover
  const handleOpen = useCallback(
    (e?: React.MouseEvent) => {
      if (readonly) return;
      e?.stopPropagation();
      setIsEditing(true);
      open();
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    },
    [readonly, setIsEditing, open]
  );

  // Handle closing the popover
  const handleClose = useCallback(() => {
    close();
    setIsEditing(false);
    setInputValue("");
  }, [close, setIsEditing]);

  // Handle saving a selected option
  const handleSave = useCallback(
    (value: string) => {
      if (!value.trim()) {
        handleClose();
        return;
      }

      let newValue: string[];

      if (props.isMultiSelect) {
        // Check if the item is already selected
        if (selectedOptions.includes(value)) {
          handleClose();
          return;
        }
        // Add new unique item
        newValue = [...selectedOptions, value];
      } else {
        // Single select: replace value
        newValue = [value];
      }

      // Update data and dispatch event
      if (saveCellValue(props, targetRef, newValue)) {
        setSelectedOptions(newValue);
      }

      handleClose();
    },
    [props, selectedOptions, handleClose]
  );

  // Handle deleting an option
  const handleDeleteOption = useCallback(
    (optionToDelete: string) => {
      const newSelectedOptions = selectedOptions.filter(
        (option) => option !== optionToDelete
      );
      setSelectedOptions(newSelectedOptions);

      // Update the data and dispatch event
      saveCellValue(props, targetRef, newSelectedOptions);
    },
    [props, selectedOptions]
  );

  // Handle keydown events
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isEditing) return;

      e.stopPropagation();

      if (e.key === "Enter") {
        e.preventDefault();
        if (inputValue.trim()) {
          handleSave(inputValue);
        }
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }
    },
    [isEditing, inputValue, handleSave, handleClose]
  );

  // Handle cell click - open on single click
  const handleCellClick = useCallback(
    (e: React.MouseEvent) => {
      // Don't open if clicking on a badge delete button
      if ((e.target as HTMLElement).closest("button")) {
        return;
      }
      handleOpen(e);
    },
    [handleOpen]
  );

  // Calculate how many badges can fit based on cell width
  const [visibleBadgeCount, setVisibleBadgeCount] = useState(2);

  useEffect(() => {
    if (!contentRef.current || selectedOptions.length === 0) {
      setVisibleBadgeCount(2);
      return;
    }

    const calculateVisibleBadges = () => {
      const container = contentRef.current;
      if (!container) return;

      const containerWidth = container.offsetWidth;
      const padding = 24; // px-3 = 12px * 2
      const gap = 6; // gap-1.5 = 6px
      const ellipsisWidth = 50; // Approximate width for "... +N more"
      const availableWidth = containerWidth - padding - ellipsisWidth;

      // Estimate badge width: ~8px per character + ~40px base padding
      let totalWidth = 0;
      let count = 0;
      const maxBadges = Math.min(selectedOptions.length, 3); // Cap at 3 max

      for (let i = 0; i < maxBadges; i++) {
        const badgeText = selectedOptions[i];
        if (!badgeText) break;
        const estimatedWidth = badgeText.length * 8 + 40; // Rough estimate
        const widthWithGap = totalWidth === 0 ? estimatedWidth : estimatedWidth + gap;

        if (totalWidth + widthWithGap <= availableWidth) {
          totalWidth += widthWithGap;
          count++;
        } else {
          break;
        }
      }

      // Always show at least 1 badge if there are any
      setVisibleBadgeCount(Math.max(count, selectedOptions.length > 0 ? 1 : 0));
    };

    calculateVisibleBadges();

    // Recalculate on resize
    const resizeObserver = new ResizeObserver(calculateVisibleBadges);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedOptions]);

  // Detect if content is multi-line
  useEffect(() => {
    if (!contentRef.current) return;

    const checkMultiLine = () => {
      const element = contentRef.current;
      if (!element) return;

      // Check if scrollHeight indicates multiple lines
      const scrollHeight = element.scrollHeight;
      const singleLineThreshold = 40;
      
      setIsMultiLine(scrollHeight > singleLineThreshold);
    };

    checkMultiLine();

    const resizeObserver = new ResizeObserver(checkMultiLine);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [selectedOptions, visibleBadgeCount]);

  const visibleBadges = selectedOptions.slice(0, visibleBadgeCount);
  const remainingCount = Math.max(selectedOptions.length - visibleBadgeCount, 0);

  return (
    <div
      ref={targetRef}
      className="size-full cursor-pointer"
      onMouseDown={handleMouseDown}
      onClick={handleCellClick}
    >
      <Popover
        opened={opened}
        width={260}
        position="bottom-start"
        offset={4}
        radius="sm"
        onDismiss={handleClose}
      >
        <Popover.Target>
          <div
            ref={contentRef}
            className={twJoin(
              "flex flex-wrap items-start gap-1.5 px-3 pb-1.5 w-full min-h-[36px] h-full",
              isMultiLine ? "pt-3" : "pt-[7px]"
            )}
          >
            {visibleBadges.map((selectedOption, index) => (
              <div key={`${selectedOption}-${index}`} className="relative">
                <Badge
                  color={getItemColor(selectedOption)}
                  variant="filled"
                  radius="sm"
                >
                  {selectedOption}
                </Badge>
              </div>
            ))}
            {remainingCount > 0 && (
              <span className="text-[11px] text-stone-500">
                … +{remainingCount} more
              </span>
            )}
          </div>
        </Popover.Target>
        <Popover.Dropdown className="ml-[-9px]">
          <div className="flex size-full flex-wrap items-center gap-x-2 gap-y-1 px-1">
            {selectedOptions.map((selectedOption, index) => (
              <div key={`${selectedOption}-${index}`} className="relative">
                <Badge
                  color={getItemColor(selectedOption)}
                  variant="filled"
                  radius="sm"
                  rightSection={
                    <ActionIcon
                      className="size-3 border-none p-0"
                      variant="transparent"
                      size="xs"
                      color="red"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteOption(selectedOption);
                      }}
                      title="Remove option"
                    >
                      <LuX size={12} />
                    </ActionIcon>
                  }
                >
                  {selectedOption}
                </Badge>
              </div>
            ))}
            {isEditing && (
              <TextInput
                ref={inputRef}
                className="min-w-1 flex-1"
                classNames={{
                  input: "text-[13px]",
                }}
                variant="unstyled"
                size="xs"
                value={inputValue}
                onKeyDown={handleKeyDown}
                onFocus={() => !readonly && setIsEditing(true)}
                onClick={(e) => e.stopPropagation()}
                onChange={(e) => setInputValue(e.target.value)}
                styles={{
                  input: {
                    fontWeight: 500,
                    pointerEvents: "auto",
                    userSelect: "text",
                    cursor: isEditing ? "text" : "default",
                    caretColor: isEditing ? "auto" : "transparent",
                  },
                  wrapper: {
                    tabIndex: 0,
                  },
                }}
                readOnly={!isEditing}
              />
            )}
          </div>
          <div className="px-3 py-2 text-xs text-gray-500">
            Select an option or create a new one
          </div>
          <div className="max-h-[120px] overflow-y-auto">
            {options.length > 0
              ? options.map((option, index) => (
                  <div
                    key={`${option}-${index}`}
                    className="flex cursor-pointer rounded-md px-2 py-1 hover:bg-stone-100"
                    onClick={() => handleSave(option)}
                  >
                    <Badge
                      color={getItemColor(option)}
                      variant="filled"
                      radius="sm"
                    >
                      {option}
                    </Badge>
                  </div>
                ))
              : inputValue.trim().length > 0 && (
                  <div
                    className="flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 hover:bg-stone-100"
                    onClick={() => handleSave(inputValue)}
                  >
                    <div className="text-xs">Create</div>
                    <Badge color="gray" variant="filled" radius="sm">
                      {inputValue}
                    </Badge>
                  </div>
                )}
          </div>
        </Popover.Dropdown>
      </Popover>
    </div>
  );
}

export default CellSelect;
