import {
  type BeforeSaveDataDetails,
  type ColumnRegular,
  type DataType,
  type DimensionColPin,
  RevoGrid,
  Template,
} from "@revolist/react-datagrid";
import {
  cellFlashArrowTemplate,
  editorCounter,
  editorSlider,
  validationRenderer,
  RowHeaderPlugin,
} from "@revolist/revogrid-pro";
import { memo, useEffect, useMemo, useRef } from "react";
import { twJoin } from "tailwind-merge";
import { z } from "zod";

import  { AddColHeader } from "~client/lib/table/cells/add-col-btn";
import CellDisplay from "~client/lib/table/cells/cell-display";
import ColHeader from "~client/lib/table/cells/col-header";
import { usePreventRangeSelection } from "~client/lib/table/hooks/table-hooks";
import { AllProviders } from "~client/main";
import { useGetVisibleColumns } from "~client/utils/utils";
import { RowAutoSizePlugin } from "@revolist/revogrid-pro";
import { getSmartColumnWidth } from "./utils/column-width";
import { CoyaxFieldTypes } from "~client/utils/types";

export const COYAX_TABLE_ROW_HEIGHT = 36;
export const COYAX_TABLE_PINNED_ROW_HEIGHT = 100;
export type CoyaxTableType = "json" | "sql";
export type CoyaxTableSaveEvent = CustomEvent<ExtendedBeforeSaveDataDetails>;

const preferredColumnOrderForTable = {
  _document_metadata: [
    "id",
    "document_number",
    "document_type",
    "date",
    "totalItems",
    "status",
  ],
  Sellers: ["id", "name", "email"],
  Buyers: ["id", "name", "email"],
  Items: ["id", "description", "quantity"],
};

interface CoyaxTableProps {
  hideAddColumn?: boolean;
  hideIdColumn?: boolean;
  hideColumns?: string[];
  tableName: string;
  data: any[];
  columns: string[];
  type?: CoyaxTableType;
  onSave?: (e: CoyaxTableSaveEvent) => void;
  afterSave?: (e: CoyaxTableSaveEvent) => void;
  options?: {
    showBottomRow?: boolean;
  };
  groupBy?: string[];
  sqlSchema?: any;
  viewId?: string;
  readonly?: boolean;
  isParserView?: boolean;
  updateJobMutation?: any;
  onRowClick?: (row: any) => void;
  canDeleteColumns?: boolean;
  canUpdateColumns?: boolean;
  plugins?: any[]; // Add this new prop
  mergeCells?: string[];
  columnOrder?: string[];
  onColumnOrderChange?: (e: any) => void;
  onRowOrderChange?: (e: any) => void;
  validateColumns?: Record<string, boolean>;
  afterValidateCol?: (e: any) => void;
  hideOpenButton?: boolean;
  pinnedColumns?: { start: string[]; end: string[] };
}

// Add this interface to extend BeforeSaveDataDetails
interface ExtendedBeforeSaveDataDetails extends BeforeSaveDataDetails {
  custom?: boolean;
}

// Note: Using MantineProvider slows down performance, but it seems the table removes access to the root provider so we need to create a new one here.
// Higher-order component to wrap a component in AllProviders and memoize it
export const withAllProviders = (Component: React.ComponentType<any>) => {
  const WrappedComponent = memo((props: any) => (
    <AllProviders>
      <Component {...props} />
    </AllProviders>
  ));
  WrappedComponent.displayName = `WithAllProviders(${Component.displayName || Component.name || "Component"})`;
  return WrappedComponent;
};

function CoyaxTable({
  tableName,
  data,
  columns,
  type: _type,
  options,
  onSave,
  afterSave,
  hideAddColumn = false,
  hideIdColumn = false,
  hideColumns = [],
  sqlSchema,
  groupBy,
  viewId,
  readonly = false,
  isParserView = false,
  updateJobMutation,
  canDeleteColumns = false,
  canUpdateColumns = false,
  onRowClick,
  plugins: customPlugins,
  mergeCells = [],
  columnOrder,
  onColumnOrderChange,
  onRowOrderChange,
  validateColumns,
  afterValidateCol,
  hideOpenButton,
  pinnedColumns,
}: CoyaxTableProps) {
  const gridRef = useRef<HTMLRevoGridElement>(null);
  usePreventRangeSelection(gridRef);

  const { getVisibleColumns } = useGetVisibleColumns();


  // TODO: Enable the hover and calculation dropdowns
  // This is the flag to enable the bottom row
  const opts = options || { showBottomRow: true };

  useEffect(() => {
    if (gridRef.current) {
      gridRef.current.addEventListener("beforeundo", (e: CustomEvent<any>) => {
        // Extract rowIndex and columnName from the data structure
        const dataKeys = Object.keys(e.detail.data || {});
        const firstKey = dataKeys[0];
        const rowIndex = firstKey ? parseInt(firstKey, 10) : undefined;

        if (rowIndex !== undefined) {
          const rowData = e.detail.data?.[rowIndex];
          const columnName = Object.keys(rowData || {})[0] as string | undefined;
          if (!columnName) {
            console.error("Could not extract columnName from event data");
            return;
          }

          // Transform the event to match what handleSave expects
          const transformedEvent = {
            ...e,
            detail: {
              ...e.detail,
              rowIndex: rowIndex,
              column: { columnName: columnName },
              val: rowData[columnName],
            },
          };
          onSave?.(transformedEvent);
        } else {
          console.error("Could not extract rowIndex from event data");
        }
      });

      gridRef.current.addEventListener("afterundo", (e: CustomEvent<any>) => {
        afterSave?.(e);
      });

      if (onColumnOrderChange) {
        gridRef.current.addEventListener(
          "beforecolumndragend",
          onColumnOrderChange
        );
      }

      if (onRowOrderChange) {
        gridRef.current.addEventListener("rowdropped", onRowOrderChange);
      }

      if (afterValidateCol) {
        gridRef.current.addEventListener("aftervalidatecol", afterValidateCol);
      }
    }
    return () => {
      if (gridRef.current) {
        gridRef.current.removeEventListener(
          "beforeundo",
          (e: CustomEvent<any>) => {
            onSave?.(e);
          }
        );

        gridRef.current.removeEventListener(
          "afterundo",
          (e: CustomEvent<any>) => {
            afterSave?.(e);
          }
        );

        if (onColumnOrderChange) {
          gridRef.current.removeEventListener(
            "beforecolumndragend",
            onColumnOrderChange
          );
        }

        if (onRowOrderChange) {
          gridRef.current.removeEventListener("rowdropped", onRowOrderChange);
        }

        if (afterValidateCol) {
          gridRef.current.removeEventListener(
            "aftervalidatecol",
            afterValidateCol
          );
        }
      }
    };
  }, []);

  // Use the passed plugins or NO plugins for parser view
  const plugins = useMemo(() => {
    if (isParserView) {
      // Parser tables: NO plugins at all
      return [];
    }
    if (customPlugins) {
      return [
        ...customPlugins,
        RowHeaderPlugin,
        RowAutoSizePlugin,
      ];
    }
    // Fallback: add context menu plugins
    return [RowHeaderPlugin, RowAutoSizePlugin];
  }, [customPlugins, isParserView]);

  // TODO: Move outside of revogrid for parser json tables
  // Sort columns based on preferredColumnOrderForTable if available
  let sortedColumns =
    Array.isArray(columnOrder) && columnOrder.length > 0
      ? columnOrder
      : [...columns!].sort((a, b) => {
        const preferredOrder =
          preferredColumnOrderForTable[
          tableName as keyof typeof preferredColumnOrderForTable
          ];
        if (!preferredOrder) return 0;

        const indexA = preferredOrder.indexOf(a);
        const indexB = preferredOrder.indexOf(b);

        // If both columns are not in preferred order, maintain their relative position
        if (indexA === -1 && indexB === -1) return 0;
        // If only a is not in preferred order, put it at the end
        if (indexA === -1) return 1;
        // If only b is not in preferred order, put it at the end
        if (indexB === -1) return -1;
        // Both columns are in preferred order, sort by their index
        return indexA - indexB;
      });

  sortedColumns = getVisibleColumns(sortedColumns);

  const revoCols: ColumnRegular[] = [
    ...sortedColumns
      .filter(
        (column) =>
          (!hideIdColumn || column !== "id") && !hideColumns.includes(column)
      )
      .map((column): ColumnRegular => {
        const field =
          sqlSchema?.tables[
            tableName === "_document_metadata" ? "documents" : tableName
          ]?.fields[column];

        const isProgressType = field?.type === CoyaxFieldTypes.Progress;
        const isCounterType = field?.type === CoyaxFieldTypes.Counter;

        return {
          prop: column,
          name:
            field?.displayName ||
            // Format column name: replace underscores with spaces and capitalize first letter
            column
              .replace(/_/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase()),
          columnTemplate: Template(withAllProviders(ColHeader), {
            isParserView,
            updateJobMutation,
            readonly,
          }),

          cellTemplate: isProgressType
            ? (editorSlider as any)
            : Template(withAllProviders(CellDisplay)),
          size:
            column === "id"
              ? 70
              : getSmartColumnWidth(
                field?.type || CoyaxFieldTypes.Text,
                column,
                data,
                groupBy
              ),
          editable: !readonly,
          min: isCounterType ? 0 : isProgressType ? 0 : undefined,
          max: isCounterType ? 100 : isProgressType ? 100 : undefined,
          step: isCounterType ? 1 : isProgressType ? 5 : undefined,
          flash: () => true,
          pin: (() => {
            // ID column is always pinned to start
            if (column === "id") return "colPinStart" as DimensionColPin;
            // Check pinned columns
            if (pinnedColumns) {
              if (pinnedColumns.start?.includes(column))
                return "colPinStart" as DimensionColPin;
              if (pinnedColumns.end?.includes(column))
                return "colPinEnd" as DimensionColPin;
            }
            return undefined;
          })(),
          tableName,
          columnName: column,
          sqlSchema: sqlSchema,
          viewId,
          readonly,
          canDeleteColumns,
          canUpdateColumns,
          columns: sortedColumns,
          merge: mergeCells.includes(column),
          isParserView,
          hideOpenButton,
          validateColumn: validateColumns?.[column],
          ...(!isParserView && column === "id" && { rowDrag: true }),
          // Enhanced number validation
          ...([CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(
            field?.type
          ) && {
            // ...validationRenderer(),
            validate: (value: any) => {
              // Check if value is a valid number
              if (value === null || value === undefined || value === "")
                return true;
              return !isNaN(Number(value)) && typeof Number(value) === "number";
            },
          }),

          // Counter validation
          ...(field?.type === CoyaxFieldTypes.Counter && {
            validate: (value: any) => {
              if (value === null || value === undefined || value === "")
                return true;
              return !isNaN(Number(value)) && typeof Number(value) === "number";
            },
          }),

          // Progress validation
          ...(field?.type === CoyaxFieldTypes.Progress && {
            validate: (value: any) => {
              if (value === null || value === undefined || value === "")
                return true;
              return !isNaN(Number(value)) && typeof Number(value) === "number";
            },
          }),

          // URL validation - supports URLs, domains (with/without protocol and www), and emails
          ...(field?.type === CoyaxFieldTypes.Url && {
            validate: (value: any) => {
              if (value === null || value === undefined || value === "")
                return true;
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
              // Remove www. prefix if present for validation
              const domainString = inputString.replace(/^www\./, "");

              // Basic domain pattern: must have at least one dot and valid characters
              const domainRegex =
                /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;

              return domainRegex.test(domainString);
            },
          }),

          ...([CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(
            field?.type
          ) && {
            filter: ["number", "slider"],
          }),

          ...(field?.type === CoyaxFieldTypes.Date && {
            filter: ["date"],
          }),

          // filter: ['number', 'slider']

          // Enhanced text validation

          // Add custom data attribute for number fields
          ...([CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(
            field?.type
          ) && {
            cellProperties: () => ({
              "data-column-type": "number",
              class: twJoin(
                "cell-flash",
                validateColumns?.[column] !== undefined &&
                (validateColumns[column] ? "bg-[#DDFFBB]" : "bg-[#FFFF99]")
              ),
            }),
          }),
        };
      }),

    ...(hideAddColumn || readonly || isParserView
      ? []
      : [
        {
          prop: "addColumn",
          name: "+",
          size: 50,
          pin: "colPinEnd" as DimensionColPin,
          // cellTemplate: Template(withAllProviders(AddColCell)),
          columnTemplate: Template(withAllProviders(AddColHeader)),
          tableName,
          sqlSchema: sqlSchema,
          viewId,
          columns: sortedColumns,
        },
      ]),
  ];

  // Add hidden grouping-only columns so RevoGrid can group on derived keys
  const existingProps = new Set(revoCols.map((c) => c.prop));
  const groupingOnlyColumns =
    (groupBy || [])
      .filter((col) => !existingProps.has(col))
      .map(
        (col): ColumnRegular => ({
          prop: col,
          name: "",
          size: 1,
          editable: false,
          resizable: false,
          readonly: true,
          columnTemplate: Template(() => null),
          cellTemplate: Template(() => null),
          tableName,
          columnName: col,
          sqlSchema: sqlSchema,
          viewId,
        })
      ) || [];

  const columnsForGrid = [...revoCols, ...groupingOnlyColumns];

  // Create sample aggregate data matching the column structure
  // const pinnedBottomData = data.length > 0 ? [{
  // 	...Object.fromEntries(
  // 		Object.keys(data[0])
  // 			.map(key => [key, `Sum: ${key}`]), // Placeholder aggregate values
  // 	),
  // }] : [];
  // const pinnedBottomData = data.length > 0 ? [{}] : [];
  const pinnedBottomData: DataType[] =
    data.length > 0
      ? [
        {
          ...Object.fromEntries(columns.map((col) => [col, null])),
          addColumn: null,
          size: COYAX_TABLE_PINNED_ROW_HEIGHT,
          calc: data.length,
        },
      ]
      : [];

  // Prevent focusing and editing of "Add Column" col and bottom row formula cells
  const handleBeforeCellFocus = (e: CustomEvent<any>) => {
    if (
      readonly ||
      e.detail?.column?.prop === "addColumn" ||
      e.detail?.type === "rowPinEnd"
    ) {
      e.preventDefault();
    }
  };

  const handleBeforeEdit = (e: CustomEvent<ExtendedBeforeSaveDataDetails>) => {
    if (
      readonly ||
      (typeof e.detail.column?.validate === "function" &&
        !e.detail.column.validate(e.detail.val))
    ) {
      e.preventDefault();
      return;
    }
    onSave?.(e);
  };

  const handleAfterEdit = (e: CustomEvent<any>) => {
    if (readonly) return;
    afterSave?.(e);
  };

  // /** Block default double-click editing */
  const handleBeforeEditStart = (e: CustomEvent<any>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const additionalData = useMemo(
    () => ({
      eventManager: {
        applyEventsToSource: true,
      },
      rowAutoSize: {
        calculateHeight: (rowData: any, columns: any[]) => {
          const maxLines = columns.reduce((max, col) => {
            const raw = rowData[col.prop];
            if (raw === null || raw === undefined) {
              return max;
            }

            const content = raw.toString().trim();
            if (!content) {
              return max;
            }

            const lines = content.split("\n");
            const actualLineCount = lines.length;

            const charactersPerLine = 40;
            const wrappedLines = lines.reduce((total: number, line: string) => {
              if (line.length === 0) {
                return total + 1;
              }
              const wrappedLineCount = Math.ceil(
                line.length / charactersPerLine
              );
              return total + Math.max(wrappedLineCount, 1);
            }, 0);

            const totalLines = Math.max(actualLineCount, wrappedLines);
            return Math.max(max, totalLines);
          }, 0);

          if (maxLines <= 1) {
            return 34;
          }

          const cappedLines = Math.min(maxLines, 2);
          const LINE_HEIGHT = 21.6;

          return Math.ceil(34 + (cappedLines - 1) * LINE_HEIGHT);
        },
      },
    }),
    []
  );

  return (
    <div className="relative h-full w-full">
      <RevoGrid
        ref={gridRef}
        columns={columnsForGrid}
        source={data}
        // rowHeaders
        pinnedBottomSource={opts.showBottomRow ? pinnedBottomData : []}
        rowSize={COYAX_TABLE_ROW_HEIGHT}
        // Disable all editing features when readonly
        readonly={readonly} // Add this
        range={!readonly} // Disable selection
        canFocus={!readonly}
        canMoveColumns={!readonly} // Disable column moving
        onBeforecellfocus={handleBeforeCellFocus}
        onBeforeedit={handleBeforeEdit}
        onAfteredit={handleAfterEdit}
        onBeforeeditstart={handleBeforeEditStart}
        onClick={(event: React.MouseEvent<HTMLRevoGridElement>) => {
          const customEvent = event as unknown as CustomEvent<any>;
          if (onRowClick) {
            onRowClick(data[customEvent.detail.row]);
          }
        }}
        grouping={{ props: groupBy, expandedAll: true }}
        additionalData={additionalData}
        plugins={plugins}
      ></RevoGrid>
    </div>
  );
}

export default CoyaxTable;
