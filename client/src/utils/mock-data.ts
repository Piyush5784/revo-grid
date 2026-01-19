// Hardcoded data to replace all TRPC/backend calls

// User Data
export const MOCK_USER_DATA = {
	id: "c4beae46-ff00-07bbc8caa2",
	finishedOnboarding: true,
	clerkId: "user_37CIpklxSAu",
	firstName: "Piyush",
	lastName: "Jha",
	email: "piyush123.jha@coyax.ai",
	referralSource: null,
	createdAt: new Date("2025-12-22T10:53:37.276Z"),
	updatedAt: new Date("2025-12-22T10:53:49.550Z"),
};

// Organization Schema Data
export const MOCK_ORG_DATA = {
	id: "85db5306-6f897e2ff83ce2",
	clerkId: "org_32DuaS7dI2QHaFf",
	name: "Coyax",
	lowercaseName: "coyax",
	domain: "coyax.ai",
	dbSchema: {
		tables: {
			orders: {
				id: "dd31d6db-156c-4986-88f0-9ade4b69f8b6",
				fields: {
					name: {
						type: "Text",
						comment: "Name of the item or service"
					},
					type: {
						type: "Text",
						comment: "Type of order - inward, outward, invoice, etc."
					},
					hsn_code: {
						type: "Text",
						comment: "HSN code or similar ID of the item"
					},
					quantity: {
						type: "Number",
						comment: "Quantity"
					},
					row_order: {
						type: "Float",
						comment: "Row position"
					},
					product_id: {
						type: "Text",
						comment: "Added from JSON import"
					},
					description: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code1: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code2: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code3: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code4: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code5: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code6: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code7: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code8: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},
					code9: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},code10: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					},code11: {
						type: "Text",
						comment: "Description of order (include the original name too)"
					}
				},
				category: "Transactional",
				displayField: "Orders"
			},
			// customers: {
			// 	id: "40a48892-50ea-457f-9644-020a513f1836",
			// 	fields: {
			// 		name: {
			// 			type: "Text",
			// 			comment: "Name of the customer"
			// 		},
			// 		site: {
			// 			type: "Text",
			// 			comment: "",
			// 			displayName: "Site"
			// 		},
			// 		email: {
			// 			type: "Text",
			// 			comment: "Email of the customer"
			// 		},
			// 		gstin: {
			// 			type: "Text",
			// 			comment: "GSTIN or similar ID of the customer",
			// 			description: "GSTIN is a tax identification number given to an organization/business"
			// 		},
			// 		phone: {
			// 			type: "Text",
			// 			comment: "Phone number of the customer"
			// 		},
			// 		status: {
			// 			type: "Single select",
			// 			comment: "",
			// 			displayName: "Status"
			// 		},
			// 		timeline: {
			// 			type: "JSON",
			// 			comment: "",
			// 			displayName: "Timeline"
			// 		},
			// 		row_order: {
			// 			type: "Float",
			// 			comment: "Row position"
			// 		},
			// 		registered_office: {
			// 			type: "Text",
			// 			comment: "Address of the customer",
			// 			displayName: "Registered Office"
			// 		}
			// 	},
			// 	category: "Master",
			// 	description: "This table contains the customers details including address, gstin and information related to customer",
			// 	displayField: "Customers"
			// },
			// products: {
			// 	id: "f3516be6-e74a-4b2a-9a1d-95690e0cbfb8",
			// 	fields: {
			// 		name: {
			// 			type: "Text",
			// 			comment: "Name of the item or service"
			// 		},
			// 		status: {
			// 			type: "Single select",
			// 			comment: "",
			// 			displayName: "Status"
			// 		},
			// 		timeline: {
			// 			type: "JSON",
			// 			comment: "",
			// 			displayName: "Timeline"
			// 		},
			// 		comments_: {
			// 			type: "JSON",
			// 			comment: "User comments for this row",
			// 			displayName: "Comments"
			// 		},
			// 		row_order: {
			// 			type: "Float",
			// 			comment: "Row position"
			// 		}
			// 	},
			// 	category: "Transactional",
			// 	displayField: "Products"
			// },
			// suppliers: {
			// 	id: "12d04821-9a02-4bdf-9fe4-22f232bf1107",
			// 	fields: {
			// 		name: {
			// 			type: "Text",
			// 			comment: "Name of the supplier"
			// 		},
			// 		email: {
			// 			type: "Text",
			// 			comment: "Email of the seller"
			// 		},
			// 		gstin: {
			// 			type: "Text",
			// 			comment: "GSTIN or similar ID of the seller"
			// 		},
			// 		notes: {
			// 			type: "Text",
			// 			comment: "Notes related to the seller"
			// 		},
			// 		phone: {
			// 			type: "Text",
			// 			comment: "Phone number of the seller"
			// 		},
			// 		address: {
			// 			type: "Text",
			// 			comment: "Address of the seller"
			// 		},
			// 		timeline: {
			// 			type: "JSON",
			// 			comment: "",
			// 			displayName: "Timeline"
			// 		},
			// 		row_order: {
			// 			type: "Float",
			// 			comment: "Row position"
			// 		}
			// 	},
			// 	category: "Master",
			// 	displayField: "Suppliers"
			// },
			// documents: {
			// 	id: "00018c79-4faa-4863-b111-f1f7e60af6c6",
			// 	fields: {
			// 		date: {
			// 			type: "Date",
			// 			comment: "Document date"
			// 		},
			// 		timeline: {
			// 			type: "JSON",
			// 			comment: "",
			// 			displayName: "Timeline"
			// 		},
			// 		comments_: {
			// 			type: "JSON",
			// 			comment: "User comments for this row",
			// 			displayName: "Comments"
			// 		},
			// 		row_order: {
			// 			type: "Float",
			// 			comment: "Row position"
			// 		},
			// 		item_count: {
			// 			type: "Number",
			// 			comment: "Total number of products in the document"
			// 		},
			// 		created_by_id: {
			// 			type: "Text",
			// 			comment: "Reference to user"
			// 		},
			// 		document_type: {
			// 			type: "Text",
			// 			comment: "Type of document"
			// 		},
			// 		document_number: {
			// 			type: "Number",
			// 			comment: "Document identifier number"
			// 		},
			// 		dynamic_columns: {
			// 			type: "JSON",
			// 			comment: "Dynamic data stored as JSON"
			// 		},
			// 		document_parser_job_id: {
			// 			type: "Text",
			// 			comment: "Reference to document parser job"
			// 		}
			// 	},
			// 	category: "Transactional",
			// 	displayField: "documents"
			// },
			// contracts: {
			// 	id: "a40e798b-0613-4ac6-ad61-6c922dda66f4",
			// 	fields: {
			// 		sr_no: {
			// 			type: "Text",
			// 			comment: "",
			// 			displayName: "Sr. No."
			// 		},
			// 		timeline: {
			// 			type: "JSON",
			// 			comment: "",
			// 			displayName: "Timeline"
			// 		},
			// 		row_order: {
			// 			type: "Float",
			// 			comment: "Row position",
			// 			displayName: "Row Order"
			// 		},
			// 		contract_end_date: {
			// 			type: "Date",
			// 			comment: "",
			// 			displayName: "Contract End Date"
			// 		},
			// 		contract_start_date: {
			// 			type: "Date",
			// 			comment: "",
			// 			displayName: "Contract Start Date"
			// 		}
			// 	},
			// 	category: "Master",
			// 	displayField: "Contracts"
			// }
		},
		relations: [
			{
				type: "M:N",
				source: {
					as: "products_",
					name: "All Products",
					table: "documents",
					relation: "belongsToMany"
				},
				target: {
					as: "documents_",
					name: "Documents",
					table: "products",
					relation: "belongsToMany"
				},
				through: "products_and_documents"
			},
			{
				type: "1:M",
				source: {
					as: "orders_",
					name: "Orders in Document",
					table: "documents",
					relation: "hasMany"
				},
				target: {
					as: "documents_",
					name: "Document Reference",
					table: "orders",
					relation: "belongsTo"
				},
				foreignKey: "document_id"
			},
			{
				type: "1:M",
				source: {
					as: "documents_",
					name: "Customer Documents",
					table: "customers",
					relation: "hasMany"
				},
				target: {
					as: "customer_",
					name: "Customer Reference",
					table: "documents",
					relation: "belongsTo"
				},
				foreignKey: "customer_id"
			},
			{
				type: "1:M",
				source: {
					as: "documents_",
					name: "Supplier Documents",
					table: "suppliers",
					relation: "hasMany"
				},
				target: {
					as: "supplier_",
					name: "Supplier Reference",
					table: "documents",
					relation: "belongsTo"
				},
				foreignKey: "supplier_id"
			},
			{
				type: "1:M",
				source: {
					as: "orders_",
					name: "Orders",
					table: "products",
					relation: "hasMany"
				},
				target: {
					as: "product_",
					name: "Product Reference",
					table: "orders",
					relation: "belongsTo"
				},
				foreignKey: "product_id"
			}
		]
	}
};

// Hook to replace useFindUniqueUser
export const useMockUser = () => {
	return {
		data: MOCK_USER_DATA,
		isLoading: false,
		error: null,
	};
};

// Hook to replace useFindFirstOrg (returns org with dbSchema)
export const useMockOrg = () => {
	return {
		data: MOCK_ORG_DATA,
		isLoading: false,
		error: null,
	};
};

// Hook to replace useSqlSchema (returns just the dbSchema)
export const useMockSqlSchema = () => {
	return MOCK_ORG_DATA.dbSchema;
};

// Re-export table data from temp.ts for use in table views
export { findUnique, findMany, sql_table_view } from './temp';
