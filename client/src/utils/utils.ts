
import { useMediaQuery } from "@mantine/hooks";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useState, useEffect, useCallback } from "react";
import { queryClient } from "~client/utils/query-client";

import { CoyaxFieldTypes, filterSchemaByPermissions, OrgPermission, type Template } from "~client/utils/types";

import { FaFilePdf, FaFileImage, FaFileWord, FaFileExcel, FaFileUpload, FaSortAmountDown } from 'react-icons/fa';

import { MOCK_ORG_DATA, findUnique, useMockOrg, useMockUser } from "./mock-data";
// Tanstack Router generic search params
export interface SearchParams {
  search: string | undefined;
}
export const validateSearch = (search: SearchParams): SearchParams => ({
  search: search.search || undefined,
});

export function useIsMobile() {
  return useMediaQuery("(max-width: 48em)");
}

/**
 * Formats the file size to readable text
 * @param bytes - The file size in bytes
 * @returns The file size in MB or GB depending on the size
 */
export const formatFileSize = (bytes: number): string => {
  const MB = 1024 * 1024;
  const GB = MB * 1024;
  if (bytes >= GB) return `${(bytes / GB).toFixed(2)} GB`;
  else return `${(bytes / MB).toFixed(2)} MB`;
};


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ================================================================================
// query management
// ================================================================================
export const invalidateQueriesForTable = (table: string) => {
  queryClient.invalidateQueries({
    predicate: (query) =>
      query.queryKey.some((key) => typeof key === "string" && key === table),
  });
};

export const refetchQueriesForTable = (table: string) => {
  queryClient.refetchQueries({
    predicate: (query) =>
      query.queryKey.some((key) => typeof key === "string" && key === table),
  });
};

export const getOrgName = () => {
  const pathParts = window.location.pathname.split("/");
  return pathParts[1];
};

export const useUserOrg = () => {
  const user = useMockUser();
  return MOCK_ORG_DATA;
};

// ================================================================================
// db queries
// ================================================================================
export const useSqlSchema = () => {
  const { permissions } = usePermissions();

  if (!MOCK_ORG_DATA.dbSchema) return null;

  const filteredSchema = filterSchemaByPermissions(
    MOCK_ORG_DATA.dbSchema,
    permissions
  ) as unknown as Template;

  return filteredSchema;
};

// ================================================================================
// naming
// ================================================================================
export const getTableDisplayName = (table: string) => {
  return table
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export function formatFieldName(fieldName: string): string {
  return fieldName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}


export const useView = (viewId: string) => {
  const isLoading = false;
  const data = findUnique.data;

  const [view, setView] = useState<any>({} as any);

  useEffect(() => {
    if (!isLoading && data) {
      setView(data as any || {} as any);
    }
  }, [isLoading, data]);

  const updateView = useCallback(
    async (field: string, operation: string, data: any) => {
      if (field === "columnOrder") {
        let columnOrder: string[] = [];

        // Get current columnOrder from state
        let updatedVisibleColumns: any = null;
        setView((prev) => {
          columnOrder = Array.isArray(prev.columnOrder)
            ? structuredClone(prev.columnOrder)
            : [];

          // Helper function to check if a column is a relationship column
          const isRelationColumn = (colName: string): boolean => {
            if (!data.sqlSchema?.relations) return false;
            return data.sqlSchema.relations.some(
              (rel: any) =>
                rel.source.as === colName || rel.target.as === colName
            );
          };

          // Helper function to separate regular and relationship columns
          const separateColumns = (cols: string[]) => {
            const regularCols = cols.filter((col) => !isRelationColumn(col));
            const relationCols = cols.filter((col) => isRelationColumn(col));
            return { regularCols, relationCols };
          };

          const ensureRelationColumnsLast = (cols: string[]) => {
            const { regularCols, relationCols } = separateColumns(cols);
            return [...regularCols, ...relationCols];
          };

          if (columnOrder.length === 0) {
            columnOrder = ensureRelationColumnsLast(data.columns);
          }

          if (operation === "addColumn") {
            const newColumnName: string = data.columnName;
            columnOrder.push(newColumnName);

            // Ensure relationship columns are always at the end
            columnOrder = ensureRelationColumnsLast(columnOrder);

            // Also update visibleColumns to include the new column with enabled: true
            if (prev.visibleColumns) {
              try {
                let parsed: any =
                  typeof prev.visibleColumns === "string"
                    ? JSON.parse(prev.visibleColumns)
                    : prev.visibleColumns;
                if (typeof parsed === "string") {
                  try {
                    parsed = JSON.parse(parsed);
                  } catch {
                    /* ignore */
                  }
                }
                const visibleColumnsArray = Array.isArray(parsed) ? parsed : [];

                // Check if column already exists in visibleColumns
                const existingIndex = visibleColumnsArray.findIndex(
                  (col: any) => col.name === newColumnName
                );

                if (existingIndex >= 0) {
                  // Update existing entry to enabled
                  visibleColumnsArray[existingIndex].enabled = true;
                } else {
                  // Add new entry
                  visibleColumnsArray.push({
                    name: newColumnName,
                    enabled: true,
                  });
                }

                updatedVisibleColumns = JSON.stringify(visibleColumnsArray);
              } catch (e) {
                // If parsing fails, don't update visibleColumns
                console.warn("Failed to parse visibleColumns:", e);
              }
            }
          }

          if (operation === "renameColumn") {
            const oldColumnName: string = data.oldColumnName;
            const newColumnName: string = data.newColumnName;

            columnOrder = columnOrder.map((col) => {
              if (col === oldColumnName) {
                return newColumnName;
              }
              return col;
            });

            // Ensure relationship columns are always at the end
            columnOrder = ensureRelationColumnsLast(columnOrder);
          }

          if (operation === "deleteColumn") {
            const columnName: string = data.columnName;
            columnOrder = columnOrder.filter((col) => col !== columnName);

            // Also remove from visibleColumns if it exists
            if (prev.visibleColumns) {
              try {
                let parsed: any =
                  typeof prev.visibleColumns === "string"
                    ? JSON.parse(prev.visibleColumns)
                    : prev.visibleColumns;
                if (typeof parsed === "string") {
                  try {
                    parsed = JSON.parse(parsed);
                  } catch {
                    /* ignore */
                  }
                }
                const visibleColumnsArray = Array.isArray(parsed) ? parsed : [];

                // Filter out the deleted column
                const filteredVisibleColumns = visibleColumnsArray.filter(
                  (col: any) => col.name !== columnName
                );

                updatedVisibleColumns = JSON.stringify(filteredVisibleColumns);
              } catch (e) {
                // If parsing fails, don't update visibleColumns
                console.warn("Failed to parse visibleColumns:", e);
              }
            }
          }

          if (operation === "order") {
            const eventColumns: string[] = Array.isArray(data.columns)
              ? data.columns.filter(Boolean)
              : [];

            if (eventColumns.length === 0) {
              return prev;
            }

            // Ensure we have a baseline columnOrder
            if (columnOrder.length === 0) {
              columnOrder = [...eventColumns];
            }

            const visibleSet = new Set(eventColumns);

            // Current order of the columns that are actually visible in the grid
            let visibleColumnsInOrder = columnOrder.filter((col) =>
              visibleSet.has(col)
            );

            // Make sure the dragged column exists in the visible collection
            if (!visibleColumnsInOrder.includes(data.columnName)) {
              visibleColumnsInOrder = [
                ...visibleColumnsInOrder,
                data.columnName,
              ];
            }

            const currentIndex = visibleColumnsInOrder.indexOf(data.columnName);
            if (currentIndex === -1) {
              return prev;
            }

            const reorderedVisible = [...visibleColumnsInOrder];
            const [movedColumn] = reorderedVisible.splice(currentIndex, 1);
            if (!movedColumn) {
              return prev;
            }

            const clampedTargetIndex = Math.max(
              0,
              Math.min(data.targetIndex, reorderedVisible.length)
            );
            reorderedVisible.splice(clampedTargetIndex, 0, movedColumn);

            // Merge reordered visible columns back with hidden ones so their relative
            // order stays untouched.
            let pointer = 0;
            columnOrder = columnOrder.map((col) => {
              if (!visibleSet.has(col)) {
                return col;
              }
              const nextCol = reorderedVisible[pointer++];
              return nextCol ?? col;
            });

            // Append any event columns that might not yet be tracked
            for (const col of eventColumns) {
              if (!columnOrder.includes(col)) {
                columnOrder.push(col);
              }
            }
          }

          return { ...prev, columnOrder };
        });

        // Update the view with new columnConfig - use mutateAsync to wait for completion
        try {
          const updateData: any = {
            columnOrder,
          };

          // Also update visibleColumns if it was modified
          if (updatedVisibleColumns !== null) {
            updateData.visibleColumns = updatedVisibleColumns;
          }


        } catch (error) {
          // If mutation fails, revert the optimistic update
          setView((prev) => ({ ...prev }));
          throw error;
        }
      }
    },
    [viewId]
  );

  return {
    view,
    updateView,
  };
};

export const getInitialsFromEmail = (email: string): string => {
  if (!email || typeof email !== "string") {
    return "";
  }

  const trimmedEmail = email.trim();
  if (!trimmedEmail) {
    return "";
  }

  // Extract the local part before the @ symbol
  const emailLocalPart = trimmedEmail.split("@")[0];
  if (!emailLocalPart) {
    return "";
  }

  // Split by common delimiters (dots, hyphens, underscores, plus signs)
  const nameParts = emailLocalPart
    .split(/[.\-_+]/)
    .filter((part) => part.length > 0);

  if (nameParts.length === 0) {
    // If no delimiters found, use the first character of the local part
    return emailLocalPart.charAt(0).toUpperCase();
  }

  // Take the first character of each part, up to 2 characters
  const initials = nameParts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials;
};
export function getTableNameById(
  sqlSchema: Template | null,
  tableId: string
): string {
  if (!sqlSchema || !sqlSchema.tables) return tableId;
  for (const [tableName, definition] of Object.entries(sqlSchema.tables)) {
    if (typeof definition === "object") {
      if ("id" in definition && (definition as any).id === tableId) {
        return tableName;
      }
    }
  }
  return tableId;
}
export function getTableDisplayFieldById(
  sqlSchema: Template | null,
  tableId: string
): string | undefined {
  if (!sqlSchema) return undefined;

  for (const [, definition] of Object.entries(sqlSchema.tables)) {
    if (definition.id === tableId) {
      return definition.displayField;
    }
  }

  return undefined;
}
export const usePermissions = () => {
  const user = useMockUser();
  const org = useMockOrg();

  // 🔍 DEBUG: Mock permissions - giving full access (empty permissions = all access)
  const mockOrgUserData = {
    role: {
      permissions: {}
    }
  };

  const permissions = mockOrgUserData?.role?.permissions || ({} as any);

  function hasPermission(scope: string, action: string, resource: string) {
    switch (scope) {
      case "tables":
        if (
          Object.keys(permissions)?.length === 0 ||
          (permissions[scope]?.[resource] &&
            Object.keys(permissions[scope][resource]).length === 0)
        ) {
          /* Select all */
          return true;
        } else {
          switch (action) {
            case OrgPermission.UPDATE:
              return (
                permissions?.tables?.[resource]?.[OrgPermission.UPDATE] || false
              );
            case OrgPermission.DELETE:
              return (
                permissions?.tables?.[resource]?.[OrgPermission.DELETE] || false
              );
            case OrgPermission.CREATE_NEW_RECORD:
              return (
                permissions?.tables?.[resource]?.[
                OrgPermission.CREATE_NEW_RECORD
                ] || false
              );
            case OrgPermission.UPDATE_RECORDS:
              return (
                permissions?.tables?.[resource]?.[
                OrgPermission.UPDATE_RECORDS
                ] || false
              );
            case OrgPermission.DELETE_RECORDS:
              return (
                permissions?.tables?.[resource]?.[
                OrgPermission.DELETE_RECORDS
                ] || false
              );
            case OrgPermission.CREATE_NEW_COLUMN:
              return (
                permissions?.tables?.[resource]?.[
                OrgPermission.CREATE_NEW_COLUMN
                ] || false
              );
            case OrgPermission.UPDATE_COLUMNS:
              return (
                permissions?.tables?.[resource]?.[
                OrgPermission.UPDATE_COLUMNS
                ] || false
              );
            case OrgPermission.DELETE_COLUMNS:
              return (
                permissions?.tables?.[resource]?.[
                OrgPermission.DELETE_COLUMNS
                ] || false
              );
          }
        }
        break;
      default:
        return false;
    }
  }

  return {
    permissions,
    hasPermission,
  };
};

export const abbreviateNumber = (value: number) => {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(value);
  return formatted;
};

export const convertToSqlNaming = (name: string): string => {
  if (!name || typeof name !== "string") return "column_1";

  // Convert to lowercase and trim
  let sqlName = name.toLowerCase().trim();

  // Replace spaces and common special characters with underscores
  sqlName = sqlName
    .replace(/[^a-z0-9]/g, "_") // replace any non-alphanumeric characters with underscores
    .replace(/_+/g, "_") // multiple underscores to single
    .replace(/^_+|_+$/g, ""); // remove leading/trailing underscores

  // Ensure it starts with a letter or underscore (SQL requirement)
  if (!/^[a-z_]/.test(sqlName)) {
    sqlName = `col_${sqlName}`;
  }

  // Truncate to PostgreSQL's 63 character limit
  if (sqlName.length > 63) {
    sqlName = sqlName.substring(0, 63);
  }

  return sqlName;
};

export const useGetVisibleColumns = () => {
  const defaultHideList = ["row_order", "comments_"];

  function filterKeyEndsWith(key: string, suffix: string) {
    return key.toLowerCase().endsWith(suffix.toLowerCase());
  }

  // Create a single function to determine if a column should be hidden
  function isColumnHidden(column: string, hideList?: string[]) {
    const combinedHideList = hideList
      ? [...defaultHideList, ...hideList]
      : defaultHideList;
    return (
      filterKeyEndsWith(column, "_id") || combinedHideList.includes(column)
    );
  }

  // Use isColumnHidden to determine visible columns
  function getVisibleColumns(columns: string[], hideList?: string[]) {
    return columns.filter((column) => !isColumnHidden(column, hideList));
  }

  return {
    isColumnHidden,
    getVisibleColumns,
  };
};

/**
 * Transforms row data for proper grouping in RevoGrid.
 * Converts array values (SingleSelect/MultiSelect) and relationship objects to strings
 * so RevoGrid can group them properly.
 * Without this, RevoGrid compares arrays/objects by reference which always fails.
 *
 * @param rows - The row data from the database
 * @param groupColumns - Array of column names to group by
 * @param sqlSchema - The SQL schema containing table and field definitions
 * @param tableName - The name of the current table
 * @returns Transformed rows with array/object values converted to strings for grouping columns
 */
export function transformDataForGrouping<T extends Record<string, any>>(
  rows: T[] | undefined,
  groupColumns: string[] | undefined,
  sqlSchema: Template | null,
  tableName: string
): T[] {
  if (!groupColumns?.length || !rows?.length || !sqlSchema) {
    return rows || [];
  }

  const tableFields = sqlSchema.tables[tableName]?.fields || {};
  const groupingKey = (col: string) => `__group__${col}`;

  // Find SingleSelect/MultiSelect columns that need transformation
  const selectColumnsToTransform = groupColumns.filter((col) => {
    const fieldType = tableFields[col]?.type;
    return (
      fieldType === CoyaxFieldTypes.MultiSelect ||
      fieldType === CoyaxFieldTypes.SingleSelect
    );
  });

  // Find relationship columns that need transformation
  const relationColumnsToTransform = groupColumns
    .filter((col) => {
      // Check if this column is a relationship (not in fields, but in relations)
      if (tableFields[col]) return false; // It's a regular field
      return sqlSchema.relations.some(
        (r) =>
          (r.source.table === tableName && r.source.as === col) ||
          (r.target.table === tableName && r.target.as === col)
      );
    })
    .map((col) => {
      // Find the relation and get the display field of the related table
      const relation = sqlSchema.relations.find(
        (r) =>
          (r.source.table === tableName && r.source.as === col) ||
          (r.target.table === tableName && r.target.as === col)
      );
      if (!relation) return { col, displayField: "id" };

      const isSource = relation.source.table === tableName;
      const relatedTableName = isSource
        ? relation.target.table
        : relation.source.table;
      const relatedTable = sqlSchema.tables[relatedTableName];
      // Preferred display order for documents
      const docOrder = [
        "document_number",
        "document_type",
        "date",
        "item_count",
        "sellers",
        "customers",
        "created_at",
        "updated_at",
      ];

      let displayField = relatedTable?.displayField || "id";
      if (relatedTableName === "documents" && relatedTable?.fields) {
        const firstDocField = docOrder.find((f) => f in relatedTable.fields);
        if (firstDocField) {
          displayField = firstDocField;
        }
      }

      return { col, displayField };
    });

  // Transform values for proper grouping
  return rows.map((row) => {
    const transformedRow = { ...row };

    // Transform SingleSelect/MultiSelect columns
    for (const col of selectColumnsToTransform) {
      const value = row[col];
      const key = groupingKey(col);

      // Preserve original value; only add a derived grouping key
      if (Array.isArray(value)) {
        // Sort and join array values to create a consistent string for grouping
        (transformedRow as any)[key] = [...value].sort().join(", ");
      } else if (value !== null && value !== undefined) {
        (transformedRow as any)[key] = String(value);
      } else {
        (transformedRow as any)[key] = "(empty)";
      }
    }

    // Helper to get display value from a relationship object
    const getDisplayValue = (
      obj: Record<string, any>,
      displayField: string
    ): string => {
      // First try the specified display field
      if (obj[displayField] !== undefined && obj[displayField] !== null) {
        return String(obj[displayField]);
      }

      // Try to find the first meaningful field (non-id, non-internal)
      const internalFields = [
        "id",
        "created_at",
        "updated_at",
        "row_order",
        "createdAt",
        "updatedAt",
      ];
      const keys = Object.keys(obj).filter(
        (k) =>
          !internalFields.includes(k) &&
          !k.endsWith("_id") &&
          !k.endsWith("Id") &&
          obj[k] !== null &&
          obj[k] !== undefined &&
          typeof obj[k] !== "object"
      );

      const firstKey = keys[0];
      if (firstKey && obj[firstKey] !== undefined) {
        return String(obj[firstKey]);
      }

      // Fall back to id
      return obj.id ? String(obj.id) : "Unknown";
    };

    // Transform relationship columns
    for (const { col, displayField } of relationColumnsToTransform) {
      const value = row[col];
      const key = groupingKey(col);

      // Preserve original value; only add a derived grouping key
      if (value === null || value === undefined) {
        (transformedRow as any)[key] = "(empty)";
      } else if (Array.isArray(value)) {
        // HasMany or ManyToMany - array of objects
        if (value.length === 0) {
          (transformedRow as any)[key] = "(empty)";
        } else {
          // Extract display value from each object and join
          const displayValues = value
            .map((item) => getDisplayValue(item, displayField))
            .filter(Boolean)
            .sort();
          (transformedRow as any)[key] = displayValues.join(", ") || "(empty)";
        }
      } else if (typeof value === "object") {
        // BelongsTo - single object
        (transformedRow as any)[key] = getDisplayValue(value, displayField);
      } else {
        // Fallback for unexpected primitive types
        (transformedRow as any)[key] = String(value);
      }
    }

    // Fallback: set grouping keys for other grouped columns (text/number/etc.)
    const handledColumns = new Set<string>([
      ...selectColumnsToTransform,
      ...relationColumnsToTransform.map((r) => r.col),
    ]);
    for (const col of groupColumns) {
      if (handledColumns.has(col)) continue;
      const key = groupingKey(col);
      const value = row[col];
      if (value === null || value === undefined) {
        (transformedRow as any)[key] = "(empty)";
      } else {
        (transformedRow as any)[key] = String(value);
      }
    }

    return transformedRow;
  });
}

/**
 * converts a value field name to upper case
 */