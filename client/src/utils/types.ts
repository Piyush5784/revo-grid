export enum ImportType {
	PASTE = 'paste',
	JSON = 'json',
	CSV = 'csv',
	XML = 'xml',
	ICAL = 'ical',
}

export const FixedTables = [
	'Sellers', 'Workflows', 'Connections', 'DynamicTables', 'Customers', 'Items', '_prisma_migrations', 'DiscordWebhook', 'Billings', 'LocalGoogleCredential', 'User', 'Slack', 'Notion', 'DynamicEntities', 'Documents',
];

export enum CoyaxModels {
	OpenAI = 'OpenAI',
	Claude = 'Claude',
	// Gemini = 'Gemini',
}

export enum CoyaxFieldTypes {
	Text = 'Text',
	LongText = "Long Text",
	Url = 'Url',
	Image = 'Image',
	Number = 'Number',
	Float = 'Float',
	Date = 'Date',
	Boolean = 'Boolean',
	JSON = 'JSON',
	Badge = 'Badge',
	SingleSelect = 'Single select',
	MultiSelect = 'Multi select',
	Relationship = 'Relationship',
	Progress = 'Progress', // Add this new type
	Counter = 'Counter', // Add this new type
}// TODO: Add nullable (allowNull) for fields that are required.

export enum RelationType {
	ManyToMany = 'M:N',
	OneToMany = '1:M',
	OneToOne = '1:1',
}

export enum AgentNames {
	InformationalAgent = 'Informational Agent',
	AnalyticsAgent = 'Analytics Agent',
	OperationalAgent = 'Operational Agent',
}

export const AgentList = [
	{
		name: 'Informational Agent',
		description: 'Monitors your entire supply chain and provides real-time insights.',
	},
	{
		name: 'Analytics Agent',
		description: 'Analyze data and create custom dashboards.',
	},
	{
		name: 'Operational Agent',
		description: 'Automate your operations and workflows.',
	},
];

/**
 * Defines the different modes for email retrieval
 */
export enum EmailRetrievalOutputType {
	ALL_ATTACHMENTS = 'ALL_ATTACHMENTS',
	ATTACHMENT_ONLY = 'ATTACHMENT_ONLY',
	WITHOUT_ATTACHMENT = 'WITHOUT_ATTACHMENT',
}

export enum ROLES {
	ADMIN = 'Admin',
	MEMBER = 'Member',
}

// Organization RBAC permission constants
export enum OrgPermission {
	ALL = 'all',
	VIEW = 'view',
	UPDATE = 'update',
	DELETE = 'delete',
	VIEW_COLUMNS = 'viewColumns',
	CREATE_NEW_COLUMN = 'createNewColumn',
	UPDATE_COLUMNS = 'updateColumns',
	DELETE_COLUMNS = 'deleteColumns',
	CREATE_NEW_RECORD = 'createNewRecord',
	UPDATE_RECORDS = 'updateRecords',
	DELETE_RECORDS = 'deleteRecords',
}

export const TRPC_ERROR_CODES = {
	INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
	BAD_REQUEST: 'BAD_REQUEST',
	UNAUTHORIZED: 'UNAUTHORIZED',
	FORBIDDEN: 'FORBIDDEN',
	NOT_FOUND: 'NOT_FOUND',
	PARSE_ERROR: 'PARSE_ERROR',
	METHOD_NOT_SUPPORTED: 'METHOD_NOT_SUPPORTED',
	TIMEOUT: 'TIMEOUT',
	CONFLICT: 'CONFLICT',
	PRECONDITION_FAILED: 'PRECONDITION_FAILED',
	PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
	UNSUPPORTED_MEDIA_TYPE: 'UNSUPPORTED_MEDIA_TYPE',
	UNPROCESSABLE_CONTENT: 'UNPROCESSABLE_CONTENT',
	TOO_MANY_REQUESTS: 'TOO_MANY_REQUESTS',
	CLIENT_CLOSED_REQUEST: 'CLIENT_CLOSED_REQUEST',
} as const;

export enum DbTableCategory {
	Master = 'Master',
	Transactional = 'Transactional',
}

export interface SortState {
	fields: {
		name: string
		direction: 'asc' | 'desc'
	}[]
}
export type VisibleColumnsState = {
	name: string
	enabled: boolean
}[];
export interface QueryOptions {
	include?: {
		model: any
		as: string
	}[]
	where?: any
	order?: [string, 'ASC' | 'DESC'][]
	limit?: number
	offset?: number
}

export enum SOCKET_EMIT_EVENTS {
	PARSER_REASONING = 'parser-reasoning',
}

export enum WIDGET_TYPES {
	BAR = 'bar',
	BAR_HORIZONTAL = 'bar_horizontal',
	LINE = 'line',
	AREA = 'area',
	PIE = 'pie',
	RADAR = 'radar',
	RADIAL = 'radial',
	CARD = 'card',
	TABLE = 'table',
	TREEMAP = 'treemap',
	COMPOSED = 'composed',
}


export enum SequelizeRelationType {
  HasMany = "hasMany",
  HasOne = "hasOne",
  BelongsTo = "belongsTo",
  BelongsToMany = "belongsToMany",
}
interface TableRelation {
  table: string;
  name: string;
  relation: SequelizeRelationType;
  as: string;
}
interface BaseRelation {
  type: RelationType;
  source: TableRelation;
  target: TableRelation;
}
interface ManyToManyRelation extends BaseRelation {
  type: RelationType.ManyToMany;
  through: string;
}
interface OneToOneOrManyRelation extends BaseRelation {
  type: RelationType.OneToMany | RelationType.OneToOne;
  foreignKey: string;
}
type Relation = ManyToManyRelation | OneToOneOrManyRelation;

export interface Template {
  tables: Record<
	string,
	{
	  id?: string;
	  category: DbTableCategory;
	  displayField: string;
	  description?: string;
	  fields: Record<
		string,
		{
		  displayName?: string;
		  type: CoyaxFieldTypes;
		  comment: string; // kept for backward compatibility from now we'lll use description insteadj
		  description?: string; 
		}
	  >;
	}
  >;
  relations: Relation[];
}

export const filterSchemaByPermissions = (dbSchema: any, permissions: any) => {
	const authorizedTables = permissions?.tables || {};

	if (Object.keys(authorizedTables).length === 0) {
		return dbSchema;
	}

	return {
		...dbSchema,
		tables: Object.keys(dbSchema.tables).reduce((tables: any, tableName: string) => {
			const table = authorizedTables[tableName];

			// No table is selected or table has view set to false -> isEmpty check is for select all
			if (!table) {
				tables[tableName] = dbSchema.tables[tableName];
			} else {
				if (table[OrgPermission.VIEW_COLUMNS]?.enabled && table[OrgPermission.VIEW_COLUMNS]?.allowedColumns?.length > 0) {
					tables[tableName] = {
						...dbSchema.tables[tableName],
						fields: Object.keys(dbSchema.tables[tableName].fields).reduce((fields: any, fieldName: string) => {
							if (table[OrgPermission.VIEW_COLUMNS]?.allowedColumns?.includes(fieldName)) {
								fields[fieldName] = dbSchema.tables[tableName].fields[fieldName];
							}
							return fields;
						}, {})
					};
				} else {
					tables[tableName] = dbSchema.tables[tableName];
				}
			}

			return tables;
		}, {})
	};
}