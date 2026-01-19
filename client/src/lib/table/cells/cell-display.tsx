import { observable } from "@legendapp/state";
import { use$ } from "@legendapp/state/react";
import { Button, Popover, Select, Space } from "@mantine/core";
import { useClickOutside } from "@mantine/hooks";
import { useDisclosure } from "@mantine/hooks";
import type {
    ColumnDataSchemaModel,
    ColumnTemplateProp,
} from "@revolist/react-datagrid";
import assign from "lodash/assign";
import debounce from "lodash/debounce";
import keys from "lodash/keys";
import pick from "lodash/pick";
import { memo, useEffect, useRef, useState, useMemo } from "react";
import { BsLayoutSidebarInsetReverse } from "react-icons/bs";
import { LuMessageSquare } from "react-icons/lu";

import CellCalc from "~client/lib/table/cells/cell-calc";
import CellBadge from "~client/lib/table/cells/types/cell-badge";
// import CellBoolean from "~client/lib/table/cells/types/cell-boolean";
import CellCounter from "~client/lib/table/cells/types/cell-counter";
import CellDate from "~client/lib/table/cells/types/cell-date";
import { CellID } from "~client/lib/table/cells/types/cell-id";
import CellImage from "~client/lib/table/cells/types/cell-image";
import CellNumber from "~client/lib/table/cells/types/cell-number";
// import CellProgress from "~client/lib/table/cells/types/cell-progress";

// import CellSelect from "~client/lib/table/cells/types/cell-select";
import CellText from "~client/lib/table/cells/types/cell-text";
import CellUrl from "~client/lib/table/cells/types/cell-url";
import { createAfterEditEvent } from "~client/lib/table/hooks/table-events";
import { getOrgName } from "~client/utils/utils";
import { DOCUMENTS_FIELD_ORDER } from "~client/utils/const";
import { CoyaxFieldTypes, type Template } from "~client/utils/types";

export const CellDisplay = (
    props: (ColumnTemplateProp | ColumnDataSchemaModel) & {
        hideOpenButton?: boolean;
    }
) => {
    const rowValue = props.data[props.rowIndex];
    const readOnly = props.column.readonly;
    const tableName =
        props.column.tableName === "_document_metadata"
            ? "documents"
            : props.column.tableName;
    const hideOpenButton = props.hideOpenButton || props.column.hideOpenButton;
    const [opened, { open, close }] = useDisclosure(false);

    // Fetch column order for the current table
    const orgName = getOrgName();
    const sqlSchemaForView = props.column.sqlSchema as unknown as Template;
    const tableSchemaForView = sqlSchemaForView?.tables?.[tableName];
    const tableId = tableSchemaForView?.id;


    // CASE - FileMetadata table
    if (tableName === "FileMetadata") {
        if (props.column.columnName === "fileUrl") {
            return <CellImage {...props} />;
        } 
    }

    // Only show relation cell for name or description columns with unresolved relations
    if (rowValue._unresolved_relations && props.column.columnName === "name") {
        return <CellResolve {...props} readOnly={readOnly} />;
    }

    if (props.type === "rowPinEnd") return <CellCalc {...props} />;

    if (props.column.columnName === "id")
        return <CellID {...props} readOnly={readOnly} />;

    const sqlSchema = props.column.sqlSchema as unknown as Template;
    const tableSchema = sqlSchema?.tables?.[tableName]!;
    let Component: React.ReactNode = null;
    if (sqlSchema && tableSchema) {
        // SQL Table Only
        const fields = tableSchema.fields;
        const field =
            fields[props.column.columnName] ||
            (props.column.isParserView && { type: CoyaxFieldTypes.Text }); // fallback to text column doesn't exist in dbOrgSchema
        if (field) {
            // Normal field
            if (
                [CoyaxFieldTypes.Text, CoyaxFieldTypes.LongText].includes(field.type)
            ) {
                Component = <CellText {...props} />;
            } else if (field.type === CoyaxFieldTypes.Url) {
                Component = <CellUrl {...props} />;
            } else if (field.type === CoyaxFieldTypes.Date) {
                Component = <CellDate {...props} />;
            } else if (
                [CoyaxFieldTypes.Number, CoyaxFieldTypes.Float].includes(field.type)
            ) {
                Component = <CellNumber {...props} />;
            } else if (field.type === CoyaxFieldTypes.Badge) {
                Component = <CellBadge {...props} />;
            }  else if (field.type === CoyaxFieldTypes.Counter) {
                Component = <CellCounter {...props} />;
            } else if (
                [CoyaxFieldTypes.SingleSelect, CoyaxFieldTypes.MultiSelect].includes(
                    field.type
                )
            ) {
                Component 
            }
        }
    } else {
        // JSON Table Only
        Component = <CellText {...props} />;
    }

    // Calculate comment count
    const commentCount = useMemo(() => {
        if (!rowValue?.comments_) return 0;

        let parsedData = rowValue.comments_;
        if (typeof rowValue.comments_ === "string") {
            try {
                parsedData = JSON.parse(rowValue.comments_);
            } catch {
                return 0;
            }
        }

        if (!Array.isArray(parsedData)) {
            return 0;
        }

        // Filter valid comments (same logic as in cell-relation.tsx)
        const validComments = parsedData.filter(
            (comment: any) =>
                comment &&
                typeof comment === "object" &&
                !Array.isArray(comment) &&
                comment.id &&
                comment.email &&
                comment.comment &&
                typeof comment.email === "string" &&
                typeof comment.comment === "string"
        );

        return validComments.length;
    }, [rowValue?.comments_]);

    const handleDoubleClick = () => { };

    return (
        <div className="group relative w-full h-full flex items-center">
            {Component}
            {props.colIndex === 0 && !hideOpenButton && (
                <>
                    <div className="absolute top-1 right-1 flex items-center gap-1.5">
                        {commentCount > 0 && (
                            <div className="flex items-center gap-1 px-1.5 py-0.5 bg-stone-100 rounded text-[10px] text-stone-600 font-medium">
                                <LuMessageSquare size={10} className="text-stone-500" />
                                <span>{commentCount}</span>
                            </div>
                        )}
                        <Button
                            size="xs"
                            variant="outline"
                            classNames={{
                                root: "border-stone-300 bg-white !h-[26px] px-0.5 !bg-white hidden group-hover:block",
                                inner: "px-1 hover:bg-stone-200 rounded-md !h-5",
                                label:
                                    "text-[10px] font-normal text-stone-500 tracking-wider uppercase",
                            }}
                            leftSection={
                                <BsLayoutSidebarInsetReverse
                                    size={10}
                                    className="text-stone-500"
                                />
                            }
                            onClick={open}
                        >
                            Open
                        </Button>
                    </div>

                </>
            )}
        </div>
    );
};

const cellResolveState = observable({
    popupOpenId: "",
    isPopupOpen: (id: string) => {
        return cellResolveState.popupOpenId.get() === id;
    },
    setPopupOpenId: (id: string) => {
        cellResolveState.popupOpenId.set(id);
    },
});

const CellResolve = (
    props: (ColumnTemplateProp | ColumnDataSchemaModel) & { readOnly: boolean }
) => {
    const [open, setOpen] = useState(false);
    const [showManualSelection, setShowManualSelection] = useState(false);
    const [search, setSearch] = useState("");
    const popoverOpened = use$(() =>
        cellResolveState.isPopupOpen(
            `${props.column.tableName}-${props.column.columnName}-${props.rowIndex}`
        )
    );


    const divRef = useRef<HTMLDivElement>(null);
    const popoverRef = useClickOutside(() => handleClosePopup());
    const rowValue = props.data[props.rowIndex];
    const relationIds = rowValue._unresolved_relations;

    const matchId = rowValue._resolved_relations;
    let matched = false;
    if (rowValue._resolved_relations) matched = true;



    useEffect(() => {
        if (popoverOpened) {
            setOpen(true);
        }
    }, []);

    const handleMatchClick = (match: any) => {
        // Update the resolved relations and dispatch the afteredit event
        const value = {
            action: "resolve",
            tableName: props.column.tableName,
            data: {
                ...props.data[props.rowIndex],
                ...assign(
                    {},
                    props.data[props.rowIndex],
                    pick(
                        match,
                        keys(props.data[props.rowIndex]).filter((k) => k !== "id")
                    )
                ),
                _resolved_relations: match.id,
            },
        };
        divRef.current?.dispatchEvent(createAfterEditEvent(props, value));
        cellResolveState.setPopupOpenId("");
    };

    const handleNoneMatchClick = () => {
        const value = {
            action: "create-new",
            tableName: props.column.tableName,
            data: {
                ...props.data[props.rowIndex],
            },
        };
        divRef.current?.dispatchEvent(createAfterEditEvent(props, value));
    };

    const debouncedSearch = debounce(async (value: string) => {
        setSearch(value);
    }, 300);

    const bgColor = matchId ? "bg-[#DDFFBB]" : "bg-[#FFFF99]";


    function handleClosePopup() {
        cellResolveState.setPopupOpenId("");
        setShowManualSelection(false);
        setOpen(false);
    }

    function handleOpenPopup() {
        if (!props.readOnly) {
            setOpen(true);
            cellResolveState.setPopupOpenId(
                `${props.column.tableName}-${props.column.columnName}-${props.rowIndex}`
            );
        }
    }

    return (
        <div
            ref={divRef}
            className={`flex size-full items-center justify-between overflow-hidden truncate px-3 text-base ${bgColor}`}
        >

            <Popover
                width={250}
                position="bottom"
                shadow="md"
                opened={open}
                onClose={handleClosePopup}
                styles={{
                    dropdown: {
                        width: "auto",
                    },
                }}
            >
                <Popover.Target>
                    <Button
                        variant="default"
                        size="compact-xs"
                        color="blue"
                        h={22}
                        className="ml-2 shrink-0 text-[11px]"
                        onClick={handleOpenPopup}
                        disabled={props.readOnly}
                    >
                        {rowValue._action === "alias"
                            ? "Alias"
                            : !!matchId
                                ? "Matched"
                                : "Resolve"}
                    </Button>
                </Popover.Target>
                <Popover.Dropdown p={0}>
                    <div ref={popoverRef} className="size-full p-4">
                        <div className="flex justify-between">
                        </div>
                        <Space h={10} />


                        <Space h={10} />
                        <div>
                            <div className="flex gap-2">
                                <Button
                                    variant="light"
                                    size="compact-xs"
                                    color="red"
                                    h={22}
                                    className="shrink-0 text-[11px]"
                                    onClick={handleNoneMatchClick}
                                >
                                    Create New
                                </Button>
                                <Button
                                    variant="default"
                                    size="compact-xs"
                                    color="blue"
                                    h={22}
                                    className="shrink-0 text-[11px]"
                                    onClick={() => setShowManualSelection(true)}
                                >
                                    Choose Existing
                                </Button>
                            </div>

                        </div>
                    </div>
                </Popover.Dropdown>
            </Popover>
        </div>
    );
};

export default memo(CellDisplay);
