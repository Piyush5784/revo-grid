import { Tooltip } from "@mantine/core";
import {
  Link,
  useParams,
} from "@tanstack/react-router";
import { Folder } from "lucide-react";
import {
  LuDatabase,
} from "react-icons/lu";

import { MyCollapse, SIDEBAR_ICON_SIZE } from "~client/lib/sidebar/sidebar";
import { DOCUMENTS_TABLE_NAME } from "~client/utils/const";
import {
  getTableDisplayName,
  usePermissions,
  useSqlSchema,
} from "~client/utils/utils";
import { OrgPermission, type DbTableCategory } from "~client/utils/types";

const sidebarIconColor = "text-stone-500"; // Lighter stone color for icons
const sidebarTextColor = "text-stone-700"; // Darker stone color for text


function DatabaseSidebar() {
  const { orgName } = useParams({ from: "/$orgName" });
  const sqlSchema = useSqlSchema();
  const { hasPermission } = usePermissions();
  if (!sqlSchema) return null;


  const tablesByCategory = Object.keys(sqlSchema.tables).reduce(
    (categories, table) => {
      const category = sqlSchema.tables?.[table]
        ?.category as keyof typeof DbTableCategory;
      if (categories[category]) {
        categories[category].push(table);
      } else {
        categories[category] = [table];
      }
      return categories;
    },
    {} as Record<keyof typeof DbTableCategory, string[]>
  );

  // Helper function to check if table operations should be restricted
  const isRestrictedTable = (tableName: string) => {
    return tableName === DOCUMENTS_TABLE_NAME;
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {Object.keys(tablesByCategory).map((category, index) => {
        const tables =
          tablesByCategory[category as keyof typeof DbTableCategory] || [];
        return (
          <div className="flex flex-col" key={index}>
            <MyCollapse
              title={category}
              icon={Folder}
              iconColor={sidebarIconColor}
              textColor={sidebarTextColor}
            >
              {tables.map((table) => {
                const tableDef = sqlSchema.tables[table] as any;
                const displayName = getTableDisplayName(tableDef.displayField);

                const canEditTable =
                  hasPermission("tables", OrgPermission.UPDATE, table) &&
                  !isRestrictedTable(table);
                const canDeleteTable =
                  hasPermission("tables", OrgPermission.DELETE, table) &&
                  !isRestrictedTable(table);
                return (
                  <div
                    className="mb-[2px] flex items-center justify-between gap-2"
                    key={table}
                  >
                    <Link
                      to="/$orgName/database/$tableId/view"
                      params={{
                        tableId: (sqlSchema.tables[table] as any).id,
                        orgName,
                      }}
                      className="sidebar-link"
                    >
                      <LuDatabase
                        size={SIDEBAR_ICON_SIZE}
                        className={sidebarIconColor}
                      />
                      <Tooltip label={displayName}>
                        <span
                          className={`${sidebarTextColor} max-w-[150px] truncate`}
                        >
                          {displayName}
                        </span>
                      </Tooltip>
                    </Link>

                  </div>
                );
              })}
            </MyCollapse>
          </div>
        );
      })}
    </div>
  );
}

export default DatabaseSidebar;
