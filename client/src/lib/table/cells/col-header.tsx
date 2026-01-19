import { Menu, TextInput, Textarea, Modal } from "@mantine/core";
import { useField } from "@mantine/form";
import { type ColumnTemplateProp as BaseColumnTemplateProp } from "@revolist/react-datagrid";
import { ChevronDown, LoaderCircle } from "lucide-react";
import React, { useRef, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import { LuCheck, LuEyeOff, LuTrash, LuPin, LuPinOff, LuPencil } from "react-icons/lu";
import { isDeepEqual } from "remeda";
import { toast } from "sonner";

import { Button } from "~client/components/ui";
import {
  convertToSqlNaming,
  invalidateQueriesForTable,
  useView,
} from "~client/utils/utils";
import { createAfterValidateColEvent } from "../hooks/table-events";
import { MAP_COYAX_FIELD_TYPE_TO_ICON } from "./types/field-icons";
import { CoyaxFieldTypes, type Template, type VisibleColumnsState } from "~client/utils/types";

const COLUMN_MENU_ICON_SIZE = 12;

interface ColumnTemplateProp extends BaseColumnTemplateProp {
  isParserView?: boolean;
  updateJobMutation?: {
    mutate: (
      params: {
        where: { id: string };
        data: { schemaSaveData: unknown };
      },
      callbacks?: {
        onSuccess?: () => void;
        onError?: (error: Error) => void;
      }
    ) => void;
  };
  readonly?: boolean;
}

const ColHeader = (props: ColumnTemplateProp) => {
  const isResizing = useRef(false);
  const startX = useRef<number>(0);
  const startWidth = useRef<number>(0);
  const columnRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);
  const [descriptionModalOpened, { open: openDescriptionModal, close: closeDescriptionModal }] = useDisclosure(false);
  const [description, setDescription] = useState<string>("");

  const isIdColumn = props.columnName === "id";



 
  const handleDeleteColumn = () => {
    if (props.isParserView) {
      const job = props.job;
      if (!job || !props.updateJobMutation) {
        toast.error("Unable to delete column: missing job data");
        return;
      }

      const schemaData = job.schemaSaveData || job.schemaRawData;
      if (!schemaData || typeof schemaData !== "object") {
        toast.error("Unable to delete column: invalid schema data");
        return;
      }

      const llmName = Object.keys(schemaData)[0];
      if (!llmName) {
        toast.error("Unable to delete column: no schema found");
        return;
      }

      // Create a deep copy of the current schema data
      const newSchemaData = JSON.parse(JSON.stringify(schemaData)) as Record<
        string,
        Record<string, unknown[] | Record<string, unknown>>
      >;

      // For document metadata, handle it as a single object
      if (props.tableName === "_document_metadata") {
        const metadataObj = newSchemaData[llmName]?.["_document_metadata"] as
          | Record<string, unknown>
          | undefined;
        if (metadataObj && typeof metadataObj === "object") {
          delete metadataObj[props.columnName];
        }
      } else {
        // For other tables, continue using map as they are arrays
        const tableData = newSchemaData[llmName]?.[props.tableName] as
          | Record<string, unknown>[]
          | undefined;
        if (Array.isArray(tableData) && newSchemaData[llmName]) {
          newSchemaData[llmName][props.tableName] = tableData.map((row) => {
            const newRow = { ...row };
            delete newRow[props.columnName];
            return newRow;
          });
        }
      }

      // Update the job with new schema data
      props.updateJobMutation.mutate(
        {
          where: { id: job.id },
          data: { schemaSaveData: newSchemaData },
        },
        {
          onSuccess: () => {
            toast.success(
              `Deleted column "${props.columnName}" from parsed data`
            );
            invalidateQueriesForTable("DocumentParserJob");
            setOpened(false);
          },
          onError: (error: Error) => {
            toast.error(`Failed to delete column: ${error.message}`);
          },
        }
      );
    } 
  };


  // Check if a column is a relationship column
  const isRelationshipColumn = (): boolean => {
    const sqlSchema = props.sqlSchema as unknown as Template;
    if (!sqlSchema?.relations) return false;
    return sqlSchema.relations.some(
      (rel) =>
        rel.source.as === props.columnName || rel.target.as === props.columnName
    );
  };

  const getFieldIcon = () => {
    const sqlSchema = props.sqlSchema as unknown as Template;
    if (sqlSchema) {
      const tableSchema =
        props.tableName === "_document_metadata"
          ? sqlSchema.tables["documents"]
          : sqlSchema.tables[props.tableName];
      if (tableSchema && props.columnName !== "id") {
        const field =
          tableSchema.fields[props.columnName] ||
          (props.isParserView && { type: CoyaxFieldTypes.Text }); // hide id col icon for fallback.
        if (field) {
          const IconComponent = MAP_COYAX_FIELD_TYPE_TO_ICON[field.type];
          if (IconComponent) {
            return <IconComponent size={12} className="text-stone-500" />;
          }
        }
      }
    }
    return null;
  };

  const handleHideColumn = () => {
    const sqlSchema = props.sqlSchema as unknown as Template;
    if (!sqlSchema) return;

    const tableSchema = sqlSchema.tables[props.tableName];
    if (!tableSchema) return;
  };







  const handleOpenDescriptionModal = () => {
    openDescriptionModal();
    setOpened(false);
  };

  const handleSaveDescription = () => {
    
  };

  return (
    <div
      className="group flex size-full transition-colors hover:bg-stone-100"
      onMouseDown={(e) => {
        // Prevent row drag events when interacting with column header
        const target = e.target as HTMLElement;
        if (
          target.closest("[data-column-menu]") ||
          target.closest(".mantine-Menu-dropdown")
        ) {
          e.stopPropagation();
        }
      }}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 pl-3.5">
        {getFieldIcon()}
        {!isIdColumn && (
          <>
            <p
              className="w-0 flex-1 truncate text-left text-[12px] font-normal text-stone-700"
              title={props.name}
            >
              {props.name}
            </p>
            {!props.readonly ? (
              <Menu
                shadow="md"
                position="bottom-start"
                width={250}
                offset={18}
                closeOnItemClick={false}
                opened={opened}
                onClose={() => setOpened(false)}
              >
                <Menu.Target>
                  <div
                    ref={columnRef}
                    data-column-menu="target"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      if (!isResizing.current) {
                        setOpened(true);
                      }
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    className="mr-2 flex items-center justify-center rounded px-1 py-0.5 transition-colors hover:bg-stone-200"
                  >
                    <ChevronDown
                      size={COLUMN_MENU_ICON_SIZE}
                      className={`cursor-pointer transition-colors ${opened ? "text-stone-700" : "text-stone-500"
                        }`}
                    />
                  </div>
                </Menu.Target>
                <Menu.Dropdown>
                  <div
                    data-column-menu="dropdown"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                    }}
                    onMouseUp={(e) => {
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    {props.isParserView ? (
                      <Menu.Item
                        color="red"
                        leftSection={<LuTrash size={COLUMN_MENU_ICON_SIZE} />}
                        onClick={handleDeleteColumn}
                        disabled={props.readonly || false}
                      >
                        Delete
                      </Menu.Item>
                    ) : (
                      <>
                        <Menu.Item
                          component="div"
                          className="hover:bg-transparent"
                        >
                        </Menu.Item>
                        {!isRelationshipColumn() && (
                          <Menu.Item
                            leftSection={<LuPencil size={COLUMN_MENU_ICON_SIZE} />}
                            onClick={handleOpenDescriptionModal}
                          >
                            Edit Description
                          </Menu.Item>
                        )}
                        {!isRelationshipColumn() && <Menu.Divider />}
                        {!isRelationshipColumn() && (
                          <Menu.Item
                            leftSection={
                              <LuEyeOff size={COLUMN_MENU_ICON_SIZE} />
                            }
                            onClick={handleHideColumn}
                          >
                            Hide Column
                          </Menu.Item>
                        )}
                      
                        <Menu.Item
                          color="red"
                          leftSection={
                           
                              <LuTrash
                                size={COLUMN_MENU_ICON_SIZE}
                                className="text-red-500"
                              />
                            
                          }
                          onClick={handleDeleteColumn}
                          disabled={!props.canDeleteColumns}
                        >
                          Delete Column
                        </Menu.Item>
                      </>
                    )}
                  </div>
                </Menu.Dropdown>
              </Menu>
            ) : null}
          </>
        )}
        {props.validateColumn === false && (
          <Button
            size="xs"
            variant="outline"
            classNames={{
              root: "rounded-md border border-green-500 bg-white absolute left-0 -bottom-[12px] px-2 !h-[22px] hidden group-hover:block hover:bg-white hover:border-green-600 transition-colors",
              label: "text-[10px] font-[600] text-stone-800",
            }}
            onClick={() =>
              columnRef.current?.dispatchEvent(
                createAfterValidateColEvent(props)
              )
            }
            leftSection={<LuCheck size={10} className="text-green-600" />}
          >
            Confirm
          </Button>
        )}
      </div>
      <Modal
        opened={descriptionModalOpened}
        onClose={closeDescriptionModal}
        title="Edit Column Description"
        size="md"
      >
        <div className="space-y-4">
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter column description..."
            label="Description"
            minRows={4}
            maxRows={8}
          />
          <div className="flex justify-end gap-2">
            <Button variant="subtle" onClick={closeDescriptionModal}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveDescription}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default React.memo(ColHeader);
