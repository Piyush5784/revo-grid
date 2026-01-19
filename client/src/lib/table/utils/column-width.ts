
import { CoyaxFieldTypes, type Template } from "~client/utils/types";

export const getColumnWidthByType = (
  fieldType: CoyaxFieldTypes,
  columnName: string
): number => {
  // Special case for ID column (selector/drag handle) - always keep compact
  if (columnName === "id") {
    return 70;
  }

  // Width mapping based on field types
  switch (fieldType) {
    case CoyaxFieldTypes.Number:
    case CoyaxFieldTypes.Float:
    case CoyaxFieldTypes.Boolean:
    case CoyaxFieldTypes.Image:
    case CoyaxFieldTypes.Counter:
      return 120;

    case CoyaxFieldTypes.Badge:
    case CoyaxFieldTypes.SingleSelect:
    default:
      return 130;

    case CoyaxFieldTypes.Date:
      return 170;

    case CoyaxFieldTypes.MultiSelect:
    case CoyaxFieldTypes.Progress:
    case CoyaxFieldTypes.Relationship:
      return 175;

    case CoyaxFieldTypes.Text:
      return 200;

    case CoyaxFieldTypes.JSON:
    case CoyaxFieldTypes.Url:
      return 225;

    case CoyaxFieldTypes.LongText:
      return 250;
  }
};

export const getSmartColumnWidth = (
  fieldType: CoyaxFieldTypes,
  columnName: string,
  data: any[],
  groupBy?: string[]
): number => {
  // ID column always stays at 120px regardless of grouping
  if (columnName === "id") {
    return 120;
  }

  const isGrouped = (groupBy?.length ?? 0) > 0;
  // Get base width by type
  const baseWidth = getColumnWidthByType(fieldType, columnName);

  let calculatedWidth: number;

  // For text and numeric fields, analyze content to determine optimal width
  if (
    (fieldType === CoyaxFieldTypes.Text ||
      fieldType === CoyaxFieldTypes.Number ||
      fieldType === CoyaxFieldTypes.Float) &&
    data.length > 0
  ) {
    // Sample first 10 rows to estimate content length
    const sampleData = data.slice(0, 10);
    const maxLength = Math.max(
      ...sampleData.map((row) => String(row[columnName] || "").length),
      columnName.length // Include header length
    );

    // Calculate width based on character count (roughly 8px per character)
    // Add extra 5px for numeric fields for better spacing
    const extraPadding =
      fieldType === CoyaxFieldTypes.Number ||
      fieldType === CoyaxFieldTypes.Float
        ? 5
        : 0;
    const contentWidth = Math.min(
      Math.max(maxLength * 8 + extraPadding, 100),
      400
    );
    calculatedWidth = Math.max(baseWidth, contentWidth);
  } else {
    const EXTRA_WIDTH = 65; // reserved space other than content
    // Calculate width based on character count (roughly 8px per character)
    const contentWidth = columnName.length * 8 + EXTRA_WIDTH;
    calculatedWidth = Math.min(Math.max(contentWidth, baseWidth), 400);
  }


  return calculatedWidth;
};

