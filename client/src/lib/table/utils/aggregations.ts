
import { CoyaxFieldTypes, type Template } from "~client/utils/types";

export type AggregationType =
  | "empty"
  | "filled"
  | "percent_empty"
  | "percent_filled"
  | "unique"
  | "min"
  | "max"
  | "sum"
  | "avg"
  | "median"
  | "true_count"
  | "false_count"
  | "percent_true"
  | "percent_false";

export interface AggregationConfig {
  [columnName: string]: {
    type: AggregationType;
  };
}

function isEmpty(value: any): boolean {
  return (
    value === null ||
    value === undefined ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0)
  );
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1]! + sorted[mid]!) / 2
    : sorted[mid]!;
}

export function calculateAggregation(
  values: any[],
  type: AggregationType,
  fieldType?: CoyaxFieldTypes
): number | string | null {
  const totalCount = values.length;
  const emptyValues = values.filter((v) => isEmpty(v));
  const filledValues = values.filter((v) => !isEmpty(v));
  const emptyCount = emptyValues.length;
  const filledCount = filledValues.length;

  switch (type) {
    case "empty":
      return emptyCount;

    case "filled":
      return filledCount;

    case "percent_empty":
      return totalCount > 0 ? (emptyCount / totalCount) * 100 : 0;

    case "percent_filled":
      return totalCount > 0 ? (filledCount / totalCount) * 100 : 0;

    case "unique": {
      const uniqueSet = new Set(
        filledValues.map((v) =>
          typeof v === "object" ? JSON.stringify(v) : String(v)
        )
      );
      return uniqueSet.size;
    }

    case "min": {
      if (
        fieldType === CoyaxFieldTypes.Date ||
        [
          CoyaxFieldTypes.Text,
          CoyaxFieldTypes.LongText,
          CoyaxFieldTypes.Url,
          CoyaxFieldTypes.Badge,
        ].includes(fieldType as CoyaxFieldTypes)
      ) {
        const validValues = filledValues.map((v) => String(v));
        return validValues.length > 0
          ? validValues.reduce((min, val) => (val < min ? val : min))
          : null;
      }
      if (
        fieldType &&
        [
          CoyaxFieldTypes.Number,
          CoyaxFieldTypes.Float,
          CoyaxFieldTypes.Counter,
          CoyaxFieldTypes.Progress,
        ].includes(fieldType)
      ) {
        const nums = filledValues
          .map((v) => Number(v))
          .filter((n) => !isNaN(n));
        return nums.length > 0 ? Math.min(...nums) : null;
      }
      return null;
    }

    case "max": {
      if (
        fieldType === CoyaxFieldTypes.Date ||
        [
          CoyaxFieldTypes.Text,
          CoyaxFieldTypes.LongText,
          CoyaxFieldTypes.Url,
          CoyaxFieldTypes.Badge,
        ].includes(fieldType as CoyaxFieldTypes)
      ) {
        const validValues = filledValues.map((v) => String(v));
        return validValues.length > 0
          ? validValues.reduce((max, val) => (val > max ? val : max))
          : null;
      }
      if (
        fieldType &&
        [
          CoyaxFieldTypes.Number,
          CoyaxFieldTypes.Float,
          CoyaxFieldTypes.Counter,
          CoyaxFieldTypes.Progress,
        ].includes(fieldType)
      ) {
        const nums = filledValues
          .map((v) => Number(v))
          .filter((n) => !isNaN(n));
        return nums.length > 0 ? Math.max(...nums) : null;
      }
      return null;
    }

    case "sum": {
      if (
        !fieldType ||
        ![
          CoyaxFieldTypes.Number,
          CoyaxFieldTypes.Float,
          CoyaxFieldTypes.Counter,
          CoyaxFieldTypes.Progress,
        ].includes(fieldType)
      ) {
        return null;
      }
      return filledValues.reduce((sum, val) => {
        const num = Number(val);
        return sum + (isNaN(num) ? 0 : num);
      }, 0);
    }

    case "avg": {
      if (
        !fieldType ||
        ![
          CoyaxFieldTypes.Number,
          CoyaxFieldTypes.Float,
          CoyaxFieldTypes.Counter,
          CoyaxFieldTypes.Progress,
        ].includes(fieldType)
      ) {
        return null;
      }
      const sum = filledValues.reduce((acc, val) => {
        const num = Number(val);
        return acc + (isNaN(num) ? 0 : num);
      }, 0);
      return filledCount > 0 ? sum / filledCount : 0;
    }

    case "median": {
      if (
        !fieldType ||
        ![
          CoyaxFieldTypes.Number,
          CoyaxFieldTypes.Float,
          CoyaxFieldTypes.Counter,
          CoyaxFieldTypes.Progress,
        ].includes(fieldType)
      ) {
        return null;
      }
      const nums = filledValues
        .map((v) => Number(v))
        .filter((n) => !isNaN(n));
      return nums.length > 0 ? calculateMedian(nums) : null;
    }

    case "true_count": {
      if (fieldType !== CoyaxFieldTypes.Boolean) return null;
      return filledValues.filter((v) => v === true || v === "true").length;
    }

    case "false_count": {
      if (fieldType !== CoyaxFieldTypes.Boolean) return null;
      return filledValues.filter((v) => v === false || v === "false").length;
    }

    case "percent_true": {
      if (fieldType !== CoyaxFieldTypes.Boolean) return null;
      const trueCount = filledValues.filter(
        (v) => v === true || v === "true"
      ).length;
      return filledCount > 0 ? (trueCount / filledCount) * 100 : 0;
    }

    case "percent_false": {
      if (fieldType !== CoyaxFieldTypes.Boolean) return null;
      const falseCount = filledValues.filter(
        (v) => v === false || v === "false"
      ).length;
      return filledCount > 0 ? (falseCount / filledCount) * 100 : 0;
    }

    default:
      return null;
  }
}

export function formatAggregationValue(
  value: number | string | null,
  type: AggregationType,
  fieldType?: CoyaxFieldTypes
): string {
  if (value === null || value === undefined) return "-";

  // Percentages
  if (
    type === "percent_empty" ||
    type === "percent_filled" ||
    type === "percent_true" ||
    type === "percent_false"
  ) {
    return `${Number(value).toFixed(0)}%`;
  }

  // Averages
  if (type === "avg") {
    return Number(value).toFixed(2);
  }

  // Medians
  if (type === "median") {
    return Number(value).toFixed(2);
  }

  // Sums
  if (type === "sum" && typeof value === "number") {
    return value.toLocaleString();
  }

  // Dates
  if (
    (type === "min" || type === "max") &&
    fieldType === CoyaxFieldTypes.Date &&
    typeof value === "string"
  ) {
    try {
      const date = new Date(value);
      return date.toLocaleDateString();
    } catch {
      return String(value);
    }
  }

  // Counts (empty, filled, unique, true_count, false_count)
  if (
    type === "empty" ||
    type === "filled" ||
    type === "unique" ||
    type === "true_count" ||
    type === "false_count"
  ) {
    return String(value);
  }

  return String(value);
}

export function getAggregationLabel(type: AggregationType): string {
  const labels: Record<AggregationType, string> = {
    empty: "Empty",
    filled: "Filled",
    percent_empty: "% Empty",
    percent_filled: "% Filled",
    unique: "Unique",
    min: "Min",
    max: "Max",
    sum: "Sum",
    avg: "Average",
    median: "Median",
    true_count: "True Count",
    false_count: "False Count",
    percent_true: "% True",
    percent_false: "% False",
  };
  return labels[type] || type;
}

export function getAvailableAggregations(
  fieldType: CoyaxFieldTypes
): AggregationType[] {
  const numericTypes = [
    CoyaxFieldTypes.Number,
    CoyaxFieldTypes.Float,
    CoyaxFieldTypes.Counter,
    CoyaxFieldTypes.Progress,
  ];

  const textTypes = [
    CoyaxFieldTypes.Text,
    CoyaxFieldTypes.LongText,
    CoyaxFieldTypes.Url,
    CoyaxFieldTypes.Badge,
  ];

  const selectTypes = [
    CoyaxFieldTypes.SingleSelect,
    CoyaxFieldTypes.Relationship,
  ];

  // Numeric types: Number, Float, Counter, Progress
  if (numericTypes.includes(fieldType)) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
      "min",
      "max",
      "sum",
      "avg",
      "median",
      "unique",
    ];
  }

  // Text types: Text, LongText, Url, Badge
  if (textTypes.includes(fieldType)) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
      "unique",
    ];
  }

  // Date
  if (fieldType === CoyaxFieldTypes.Date) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
      "min",
      "max",
      "unique",
    ];
  }

  // Boolean
  if (fieldType === CoyaxFieldTypes.Boolean) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
      "true_count",
      "false_count",
      "percent_true",
      "percent_false",
    ];
  }

  // Single Select / Relationship
  if (selectTypes.includes(fieldType)) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
      "unique",
    ];
  }

  // MultiSelect
  if (fieldType === CoyaxFieldTypes.MultiSelect) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
      "unique",
    ];
  }

  // JSON / Image
  if (
    fieldType === CoyaxFieldTypes.JSON ||
    fieldType === CoyaxFieldTypes.Image
  ) {
    return [
      "empty",
      "filled",
      "percent_empty",
      "percent_filled",
    ];
  }

  // Default fallback
  return ["empty", "filled", "percent_empty", "percent_filled"];
}

// Group aggregations by category for menu display
export function getAggregationsByCategory(
  fieldType: CoyaxFieldTypes
): Record<string, AggregationType[]> {
  const availableAggs = getAvailableAggregations(fieldType);

  const groupedAggs: Record<string, AggregationType[]> = {
    Counts: [],
    Percentages: [],
    Statistics: [],
    Boolean: [],
  };

  availableAggs.forEach((agg) => {
    if (
      agg === "percent_empty" ||
      agg === "percent_filled"
    ) {
      groupedAggs.Percentages.push(agg);
    } else if (
      agg === "true_count" ||
      agg === "false_count" ||
      agg === "percent_true" ||
      agg === "percent_false"
    ) {
      groupedAggs.Boolean.push(agg);
    } else if (
      agg === "min" ||
      agg === "max" ||
      agg === "sum" ||
      agg === "avg" ||
      agg === "median"
    ) {
      groupedAggs.Statistics.push(agg);
    } else {
      groupedAggs.Counts.push(agg);
    }
  });

  // Remove empty categories
  return Object.fromEntries(
    Object.entries(groupedAggs).filter(([_, aggs]) => aggs.length > 0)
  );
}

