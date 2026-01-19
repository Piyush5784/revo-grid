import { Button, Popover, Select, TextInput, Textarea, ScrollArea } from "@mantine/core";
import type {
  ColumnDataSchemaModel,
  ColumnTemplateProp,
} from "@revolist/react-datagrid";
import { useState, useEffect } from "react";
import { LuPlus } from "react-icons/lu";
import { Checkbox } from "~client/components/ui";
import {
  convertToSqlNaming,
  invalidateQueriesForTable,
} from "~client/utils/utils";
import { MAP_COYAX_FIELD_TYPE_TO_ICON } from "./types/field-icons";
import { CoyaxFieldTypes, type Template } from "~client/utils/types";

/** Hide all cells in the add column */
const AddColCell = (props: ColumnTemplateProp | ColumnDataSchemaModel) => {
  const isSqlTable = Boolean(props.column?.sqlSchema);

  if (!isSqlTable) {
    return (
      <div
        className="flex size-full cursor-pointer items-center justify-center border-none bg-transparent text-red-500 hover:bg-red-50"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <LuPlus size={12} />
      </div>
    );
  }

  return (
    <div
      className="add-column-cell flex size-full items-center justify-center border-none bg-transparent text-black"
      onClick={(e) => e.stopPropagation()}
    />
  );
};

const REMOVE_FIELD_TYPES = [CoyaxFieldTypes.JSON, CoyaxFieldTypes.Image];

// Categorize field types for better organization
// const SUGGESTED_TYPES = [CoyaxFieldTypes.Text, CoyaxFieldTypes.Number];

const BASIC_TYPES = [
  CoyaxFieldTypes.Text,
  CoyaxFieldTypes.LongText,
  CoyaxFieldTypes.Number,
  CoyaxFieldTypes.Float,
  CoyaxFieldTypes.SingleSelect,
  CoyaxFieldTypes.MultiSelect,
  CoyaxFieldTypes.Badge,
  CoyaxFieldTypes.Boolean,
];

const ADVANCED_TYPES = [
  CoyaxFieldTypes.Date,
  CoyaxFieldTypes.Url,
  CoyaxFieldTypes.Progress,
  CoyaxFieldTypes.Counter,
];

const SPECIAL_TYPES = [CoyaxFieldTypes.Relationship];

/** Add Col Header - allows creating new columns */
export const AddColHeader = (
  props: ColumnTemplateProp | ColumnDataSchemaModel
) => {
  const [opened, setOpened] = useState(false);
  const [newColName, setNewColName] = useState("");
  const [newColType, setNewColType] = useState<CoyaxFieldTypes>(
    CoyaxFieldTypes.Text
  );
  const [targetTable, setTargetTable] = useState<string>("");
  const [allowManyToMany, setAllowManyToMany] = useState(false);
  const [description, setDescription] = useState<string>("");

  const sqlSchema = (props as any).sqlSchema as unknown as Template;
  const availableTables = Object.keys(sqlSchema.tables)
    .filter((t) => t !== (props as any).tableName)
    .map((tableName) => {
      const tableDefinition = sqlSchema.tables[tableName];
      return {
        value: tableName,
        label: tableDefinition?.displayField || tableName,
      };
    });
  const showTargetTableSelect = newColType === CoyaxFieldTypes.Relationship;

  // Clear description when switching to Relationship type
  useEffect(() => {
    if (showTargetTableSelect) {
      setDescription("");
    }
  }, [showTargetTableSelect]);

  const fieldTypes = Object.values(CoyaxFieldTypes).filter(
    (type) => !REMOVE_FIELD_TYPES.includes(type)
  );
  const canSubmit =
    newColName.length > 0 &&
    (!showTargetTableSelect ||
      (showTargetTableSelect && targetTable.length > 0));

  const handleCreateColumn = () => {
    const columnName = convertToSqlNaming(newColName);
    createColumn(
      {
        tableName: (props as any).tableName,
        columnName,
        displayName: newColName, // Pass the original display name
        columnType: newColType,
        targetTable: showTargetTableSelect ? targetTable : undefined,
        allowManyToMany,
        // Only include description for non-relationship columns
        ...(!showTargetTableSelect && description.trim() && { description: description.trim() }),
      },
      {
        onSuccess: () => {
          updateView("columnOrder", "addColumn", {
            columnName,
            columns: (props as any).columns,
            sqlSchema,
          });
          invalidateQueriesForTable("Org");
          setOpened(false);
          setNewColName("");
          setNewColType(CoyaxFieldTypes.Text);
          setTargetTable("");
          setAllowManyToMany(false);
          setDescription("");
        },
      }
    );
  };

  return (
    <Popover
      position="bottom-start"
      shadow="md"
      opened={opened}
      onChange={setOpened}
      trapFocus={false}
      closeOnClickOutside={true}
      closeOnEscape={true}
      width={380}
    >
      <Popover.Target>
        <div
          className="flex size-full cursor-pointer items-center justify-center border-none bg-transparent text-base font-bold text-blue-500 hover:bg-stone-200"
          onClick={() => setOpened((o) => !o)}
        >
          <LuPlus size={16} />
        </div>
      </Popover.Target>

      <Popover.Dropdown className="rounded-lg border border-gray-200 bg-white p-0 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
          {/* Header with Name Input */}
          <div className="border-b border-gray-100 px-3 py-2">
            <div className="flex items-center gap-1">
              <div className="flex h-6 w-6 items-center justify-center text-gray-400">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                >
                  <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm0 10.5a.75.75 0 110-1.5.75.75 0 010 1.5zm.75-3.75a.75.75 0 01-1.5 0V4.5a.75.75 0 011.5 0v3.25z" />
                </svg>
              </div>
              <TextInput
                placeholder="Type property name..."
                size="sm"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                classNames={{
                  root: "flex-1",
                  input:
                    "border-0 rounded-none text-[14px] p-0 bg-transparent leading-none min-h-[24px] h-[24px] focus:bg-transparent focus:shadow-none placeholder:text-gray-400",
                }}
              />
            </div>
          </div>

          <ScrollArea h={284} offsetScrollbars>
            <div className="py-2 px-2">
              {/* Suggested Section */}
              {/* <div className="mb-3 px-2">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Suggested
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {SUGGESTED_TYPES.filter((type) =>
                    fieldTypes.includes(type)
                  ).map((type: CoyaxFieldTypes) => {
                    const Icon = MAP_COYAX_FIELD_TYPE_TO_ICON[type];
                    const isSelected = newColType === type;
                    return (
                      <div
                        key={type}
                        className={`group flex cursor-pointer items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-all duration-150 ${
                          isSelected
                            ? "bg-blue-50 ring-1 ring-blue-200"
                            : "bg-gray-50 hover:bg-gray-100"
                        }`}
                        onClick={() => setNewColType(type)}
                      >
                        <span
                          className={`flex items-center justify-center transition-colors ${
                            isSelected
                              ? "text-blue-600"
                              : "text-gray-500 group-hover:text-gray-700"
                          }`}
                        >
                          {Icon && <Icon size={16} />}
                        </span>
                        <span
                          className={`text-[13px] font-medium ${
                            isSelected
                              ? "text-blue-700"
                              : "text-gray-700 group-hover:text-gray-900"
                          }`}
                        >
                          {type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div> */}

              {/* Basic Types Section */}
              <div className="relative px-2 pt-2">
                {/* <div className="absolute -top-px inset-x-3 h-px bg-gray-200"></div> */}
                <div className="mb-1 px-1 text-xs font-medium text-gray-500">
                  Select type
                </div>
                <div className="grid grid-cols-2 gap-0">
                  {BASIC_TYPES.filter((type) => fieldTypes.includes(type)).map(
                    (type: CoyaxFieldTypes) => {
                      const Icon = MAP_COYAX_FIELD_TYPE_TO_ICON[type];
                      const isSelected = newColType === type;
                      return (
                        <div
                          key={type}
                          className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-1 min-h-[32px] w-full transition-all duration-75 ${isSelected ? "bg-gray-100" : "hover:bg-gray-50"
                            }`}
                          onClick={() => setNewColType(type)}
                        >
                          <span className="flex items-center justify-center min-w-5 min-h-5">
                            {Icon && (
                              <Icon
                                size={15}
                                className="scale-110 text-stone-800"
                              />
                            )}
                          </span>
                          <span className="text-[13px] leading-tight text-stone-800">
                            {type}
                          </span>
                        </div>
                      );
                    }
                  )}
                </div>
              </div>

              {/* Advanced Types Section */}
              <div className="px-2 pb-2">
                <div className="grid grid-cols-2 gap-0">
                  {ADVANCED_TYPES.filter((type) =>
                    fieldTypes.includes(type)
                  ).map((type: CoyaxFieldTypes) => {
                    const Icon = MAP_COYAX_FIELD_TYPE_TO_ICON[type];
                    const isSelected = newColType === type;
                    return (
                      <div
                        key={type}
                        className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-1 min-h-[32px] w-full transition-all duration-75 ${isSelected ? "bg-gray-100" : "hover:bg-[#f3f3f3]"
                          }`}
                        onClick={() => setNewColType(type)}
                      >
                        <span className="flex items-center justify-center min-w-5 min-h-5">
                          {Icon && (
                            <Icon
                              size={15}
                              className="scale-110 text-gray-500"
                            />
                          )}
                        </span>
                        <span className="text-[13px] leading-tight text-gray-900">
                          {type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Special Types Section - Relationship */}
              <div className="relative px-2 pt-2 pb-1">
                <div className="absolute -top-px inset-x-3 h-px bg-gray-200"></div>
                <div className="grid grid-cols-2 gap-0">
                  {SPECIAL_TYPES.filter((type) =>
                    fieldTypes.includes(type)
                  ).map((type: CoyaxFieldTypes) => {
                    const Icon = MAP_COYAX_FIELD_TYPE_TO_ICON[type];
                    const isSelected = newColType === type;
                    return (
                      <div
                        key={type}
                        className={`group flex cursor-pointer items-center gap-2 rounded-md px-3 py-1 min-h-[32px] w-full transition-all duration-75 ${isSelected ? "bg-gray-100" : "hover:bg-[#f3f3f3]"
                          }`}
                        onClick={() => setNewColType(type)}
                      >
                        <span className="flex items-center justify-center min-w-5 min-h-5">
                          {Icon && (
                            <Icon
                              size={16}
                              className="scale-110 text-gray-500"
                            />
                          )}
                        </span>
                        <span className="text-[13px] leading-tight text-gray-900">
                          {type}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Relationship Configuration Section */}
          {showTargetTableSelect && (
            <div className="border-t border-gray-100 px-3 py-2.5">
              <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Relationship Settings
              </div>
              <Select
                placeholder="Select table to link"
                data={availableTables}
                size="xs"
                className="mb-2.5"
                value={targetTable}
                onChange={(value) => setTargetTable(value || "")}
                comboboxProps={{
                  withinPortal: false,
                }}
                classNames={{
                  input:
                    "border border-gray-200 rounded-[3px] text-[13px] bg-white focus:border-gray-300 focus:shadow-none",
                }}
              />

              <Checkbox
                checked={allowManyToMany}
                onChange={(e) => setAllowManyToMany(e.currentTarget.checked)}
                label="Allow multiple relationships"
                size="xs"
                classNames={{
                  root: "flex items-center",
                  label: "text-[13px] text-gray-500 font-normal pl-1.5",
                  input:
                    "cursor-pointer checked:bg-gray-700 checked:border-gray-700",
                }}
              />
            </div>
          )}

          {/* Description Input - Only show for non-relationship columns */}
          {!showTargetTableSelect && (
            <div className="border-t border-gray-100 px-4 py-2.5">
              <div className="mb-2 px-1 text-xs font-medium text-gray-500">
                Description
              </div>
              <Textarea
                placeholder="Enter column description (optional)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                minRows={2}
                maxRows={4}
                size="xs"
                classNames={{
                  input: "border border-gray-200 rounded-[3px] text-[13px] bg-white focus:border-gray-300 focus:shadow-none",
                }}
              />
            </div>
          )}

          {/* Action Button */}
          <div className="border-t border-gray-100 px-3 py-2.5">
            <Button
              disabled={!canSubmit}
              variant="filled"
              color="blue"
              leftSection={<LuPlus size={13} />}
              fullWidth
              onClick={handleCreateColumn}
              size="xs"
              classNames={{
                root: `rounded-[3px] text-[13px] font-medium  text-center ${canSubmit
                    ? "bg-stone-800 text-white hover:bg-stone-700"
                    : "bg-gray-200 text-gray-400"
                  }`,
              }}
            >
              Create column
            </Button>
          </div>
        </div>
      </Popover.Dropdown>
    </Popover>
  );
};

export default AddColCell;
