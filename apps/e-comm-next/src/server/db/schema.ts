import { relations, sql } from "drizzle-orm";
import {
  foreignKey,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `e-comm-next_${name}`);

const timestamps = {
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  deletedAt: timestamp("delete_at", { mode: "date", withTimezone: true }),
};

const userRoles = ["user", "moderator", "admin"] as const;
export type UserRoles = (typeof userRoles)[number][];
export const rolesEnum = pgEnum("roles", userRoles);

const userPermissions = [
  "createCategory",
  "updateCategory",
  "deleteCategory",
] as const;

export type UserPermissions = typeof userPermissions;
export const permissionsEnum = pgEnum("permissions", userPermissions);

/* TABLE: users */
export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  role: rolesEnum().default("user").notNull(),
  permissions: permissionsEnum().array().default([]),
  password: varchar("password").notNull(),
  email: varchar("email", { length: 255 }).unique().notNull(),
  emailVerified: timestamp("email_verified", {
    mode: "date",
    withTimezone: true,
  }),
  image: varchar("image", { length: 255 }),
  ...timestamps,
});

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  addresses: many(addresses),
  invoices: many(invoices),
  payments: many(payments),
  sessions: many(sessions),
}));

/* TABLE: accounts */
export const accounts = createTable(
  "account",
  {
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    type: varchar("type", { length: 255 }),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("provider_account_id", {
      length: 255,
    }).notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
    ...timestamps,
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
    index("account_user_id_idx").on(account.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

/* TABLE: sessions */
export const sessions = createTable(
  "session",
  {
    sessionToken: varchar("session_token", { length: 255 })
      .notNull()
      .primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    ...timestamps,
  },
  (session) => [index("session_user_id_idx").on(session.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

/* TABLE: verification_tokens */
export const verificationTokens = createTable(
  "verification_token",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);

/* TABLE: brands */
export const brands = createTable("brands", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 30 }).notNull().unique(),
  description: varchar("description", { length: 2000 }),
});

export const brandsRelation = relations(brands, ({ many }) => ({
  brandCategories: many(brandCategories),
  products: many(products),
}));

/* TABLE: categories */
export const categories = createTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    parentCategoryId: integer(),
    description: varchar("description", { length: 2000 }),
  },
  (table) => [
    foreignKey({
      columns: [table.parentCategoryId],
      foreignColumns: [table.id],
      name: "subcategories",
    }),
  ],
);

export const categoriesRelation = relations(categories, ({ many }) => ({
  brandCategories: many(brandCategories),
}));

/* TABLE: products */
export const products = createTable("products", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  categoryId: integer("category_id").notNull(),
  brandId: integer(),
  description: text("description"),
  price: integer("price").notNull(),
  sku: varchar("sku", { length: 255 }).notNull().unique(), //unique identifier in storage
  netWeight: integer("net_weight"),
  images: integer().array(),
  ...timestamps,
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  brand: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  invoiceItems: many(invoiceItems),
  productProperties: many(productProperties),
  productStorage: many(productStorage),
  productImages: many(productImages),
}));

/* TABLE: product_images */
export const productImages = createTable("product_images", {
  id: integer().primaryKey().generatedByDefaultAsIdentity(),
  url: text().notNull(),
  productId: integer().notNull(),
});

export const productImagesRelation = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.id],
    references: [products.id],
  }),
}));

/* TABLE: addresses */
export const addresses = createTable("addresses", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id", { length: 255 }).notNull(),
  address: text("address").notNull(),
  postalCode: varchar("postal_code", { length: 255 }).notNull(),
  latitude: integer("latitude"),
  longitude: integer("longitude"),
  ...timestamps,
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, { fields: [addresses.userId], references: [users.id] }),
}));

/* TABLE: invoice_items */
export const invoiceItems = createTable("invoice_items", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  invoiceId: integer(),
  productId: integer(),
  quantity: integer("quantity").notNull(),
  price: integer("price").notNull(),
  ...timestamps,
});

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
  product: one(products, {
    fields: [invoiceItems.productId],
    references: [products.id],
  }),
}));

/* TABLE: invoices */
export const invoices = createTable("invoices", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  userId: varchar("user_id", { length: 255 }),
  addressId: integer(),
  invoiceDate: timestamp("invoice_date", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  status: varchar("status", { length: 255 }).notNull(),
  ...timestamps,
});

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  user: one(users, { fields: [invoices.userId], references: [users.id] }),
  address: one(addresses, {
    fields: [invoices.addressId],
    references: [addresses.id],
  }),
  invoiceItems: many(invoiceItems),
  payments: many(payments),
}));

/* TABLE: payments */
export const payments = createTable("payments", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  invoiceId: integer(),
  userId: varchar("user_id", { length: 255 }),
  amount: integer("amount").notNull(),
  paymentDate: timestamp("payment_date", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  paymentMethod: varchar("payment_method", { length: 255 }).notNull(),
  ...timestamps,
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  invoice: one(invoices, {
    fields: [payments.invoiceId],
    references: [invoices.id],
  }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}));

/* TABLE: product_properties */
export const productProperties = createTable(
  "product_properties",
  {
    productId: integer().notNull(),
    propertyId: integer().notNull(),
    value: varchar("value").notNull(),
  },
  (pp) => [
    // index("product_properties_product_id_idx").on(pp.productId),
    // index("product_properties_property_id_idx").on(pp.propertyId),
    index("product_properties_property_value_idx").on(pp.value),
    index("product_properties_property_idx").on(
      pp.value,
      pp.productId,
      pp.propertyId,
    ),
  ],
);

export const productPropertiesRelations = relations(
  productProperties,
  ({ one }) => ({
    product: one(products, {
      fields: [productProperties.productId],
      references: [products.id],
    }),
    property: one(properties, {
      fields: [productProperties.propertyId],
      references: [properties.id],
    }),
  }),
);

/* TABLE: product_storage */
export const productStorage = createTable("product_storage", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  productId: integer().notNull(),
  storageId: varchar("storage_id", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  ...timestamps,
});

export const productStorageRelations = relations(productStorage, ({ one }) => ({
  product: one(products, {
    fields: [productStorage.productId],
    references: [products.id],
  }),
  storage: one(storages, {
    fields: [productStorage.storageId],
    references: [storages.id],
  }),
}));

export const propertiesTypeEnum = ["string", "number", "enum"] as const;
export type PropertiesTypeEnum = (typeof propertiesTypeEnum)[number];
export const propertiesType = pgEnum("properties_type", propertiesTypeEnum);
/* TABLE: properties */
export const properties = createTable(
  "properties",
  {
    id: integer("id").generatedByDefaultAsIdentity(),
    categoryId: integer().notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    type: propertiesType().notNull(),
  },
  (property) => [
    primaryKey({
      columns: [property.categoryId, property.name, property.type],
    }),
  ],
);

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  category: one(categories, {
    fields: [properties.categoryId],
    references: [categories.id],
  }),
  productProperties: many(productProperties),
}));

/* TABLE: storage_transactions */
export const storageTransactions = createTable("storage_transactions", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  storageId: varchar("storage_id", { length: 255 }),
  productId: integer(),
  transactionType: varchar("transaction_type", { length: 255 }).notNull(),
  quantity: integer("quantity").notNull(),
  transactionDate: timestamp("transaction_date", {
    mode: "date",
    withTimezone: true,
  }).default(sql`CURRENT_TIMESTAMP`),
  invoiceId: integer(),
  ...timestamps,
});

export const storageTransactionsRelations = relations(
  storageTransactions,
  ({ one }) => ({
    storage: one(storages, {
      fields: [storageTransactions.storageId],
      references: [storages.id],
    }),
    product: one(products, {
      fields: [storageTransactions.productId],
      references: [products.id],
    }),
    invoice: one(invoices, {
      fields: [storageTransactions.invoiceId],
      references: [invoices.id],
    }),
  }),
);

/* TABLE: storages */
export const storages = createTable("storages", {
  id: integer("id").primaryKey().generatedByDefaultAsIdentity(),
  location: varchar("location", { length: 255 }).notNull(),
  capacity: integer("capacity").notNull(),
  ...timestamps,
});

export const storagesRelations = relations(storages, ({ many }) => ({
  productStorage: many(productStorage),
  storageTransactions: many(storageTransactions),
}));

/* TABLE: brand_categories (bridge table between brands and categories) */
export const brandCategories = createTable(
  "brand_categories",
  {
    id: serial(),
    brandId: integer("brand_id").notNull(),
    categoryId: integer("category_id").notNull(),
  },
  (bc) => [primaryKey({ columns: [bc.brandId, bc.categoryId] })],
);

export const brandCategoriesRelations = relations(
  brandCategories,
  ({ one }) => ({
    brand: one(brands, {
      fields: [brandCategories.brandId],
      references: [brands.id],
    }),
    category: one(categories, {
      fields: [brandCategories.categoryId],
      references: [categories.id],
    }),
  }),
);
