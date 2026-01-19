export const ICON_STROKE = 1.5;

export const DOCUMENTS_TABLE_NAME = "documents";
export const FILTERED_FIELDS_FOR_DOCUMENTS = [
  "created_by_id",
  "dynamic_columns",
  "document_parser_job_id",
];

export const DOCUMENTS_FIELD_ORDER = [
  "id",
  "document_number",
  "document_type",
  "date",
  "item_count",
  "sellers",
  "customers",
  "created_at",
  "updated_at",
];

export const TABLE_CATEGORIES = {
  MASTER: "Master",
  TRANSACTIONAL: "Transactional",
} as const;
