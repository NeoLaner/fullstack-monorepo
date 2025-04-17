import { relations } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTableCreator,
  primaryKey,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `stream-tube-next_${name}`);

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

export const statusEnum = pgEnum("status", [
  "recent",
  "watched",
  "watch_later",
]);
export const qualityTypesEnum = pgEnum("quality_types", [
  "WebDl",
  "BluRay",
  "CAM",
]);
export const subtitleEnum = pgEnum("subtitle", ["hardsub", "softsub"]);
export const mediaSourceTypeEnum = pgEnum("media_source_type", ["media"]);
export const subSourceTypeEnum = pgEnum("sub_source_type", ["subtitle"]);
export const mediaTypeEnum = pgEnum("media_type", ["movie", "series", "other"]);
export const visibilityEnum = pgEnum("visibility", [
  "public",
  "friends",
  "private",
]);

// Existing tables

/* TABLE: users */
export const users = createTable("user", {
  id: varchar("id", { length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 255 }).notNull(),
  role: rolesEnum().default("user").notNull(),
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
  sessions: many(sessions),
  rooms: many(rooms),
  sources: many(sources),
  mediaSources: many(mediaSources),
  subtitleSources: many(subtitleSources),
  mediaSourceInteractions: many(mediaSourceInteractions),
  collections: many(collections),
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

// New tables from Prisma schema

/* TABLE: rooms */
export const rooms = createTable("room", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  type: varchar("type", { length: 255 }).notNull(),
  imdbId: varchar("imdb_id", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).default(""),
  name: varchar("name", { length: 255 }).notNull(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  online: boolean("online").default(false).notNull(),
  timeWatched: timestamp("time_watched", { mode: "date", withTimezone: true }),
  season: integer("season"),
  episode: integer("episode"),
  isPublic: boolean("is_public").default(false).notNull(),
  status: statusEnum(),
  isFavorite: boolean("is_favorite").notNull(),
  allowedGuestsId: varchar("allowed_guests_id", { length: 255 })
    .array()
    .notNull(),
  bannedGuestsId: varchar("banned_guests_id", { length: 255 })
    .array()
    .notNull(),
  collectionId: varchar("collection_id", { length: 255 }),
});

export const roomsRelations = relations(rooms, ({ one, many }) => ({
  owner: one(users, { fields: [rooms.ownerId], references: [users.id] }),
  sources: many(sources),
  collection: one(collections, {
    fields: [rooms.collectionId],
    references: [collections.id],
  }),
}));

/* TABLE: sources */
export const sources = createTable("source", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  roomId: varchar("room_id", { length: 255 }).unique().notNull(),
  userId: varchar("user_id", { length: 255 }).unique().notNull(),
  mediaSourceId: varchar("media_source_id", { length: 255 }),
  subtitleSourceId: varchar("subtitle_source_id", { length: 255 }),
});

export const sourcesRelations = relations(sources, ({ one }) => ({
  room: one(rooms, { fields: [sources.roomId], references: [rooms.id] }),
  user: one(users, { fields: [sources.userId], references: [users.id] }),
  mediaSource: one(mediaSources, {
    fields: [sources.mediaSourceId],
    references: [mediaSources.id],
  }),
  subtitleSource: one(subtitleSources, {
    fields: [sources.subtitleSourceId],
    references: [subtitleSources.id],
  }),
}));

/* TABLE: media_sources */
export const mediaSources = createTable("media_source", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  imdbId: varchar("imdb_id", { length: 255 }).notNull(),
  protocol: varchar("protocol", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  pathname: varchar("pathname", { length: 255 }).notNull(),
  type: mediaSourceTypeEnum().default("media").notNull(),
  mediaType: mediaTypeEnum().notNull(),
  description: text("description"),
  roomId: varchar("room_id", { length: 255 }).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  disabled: boolean("disabled").notNull(),
  canBePublic: boolean("can_be_public").notNull(),
  usersLikesId: varchar("users_likes_id", { length: 255 }).array().notNull(),
  name: varchar("name", { length: 255 }).default("").notNull(),
  quality: varchar("quality", { length: 255 }),
  qualityType: qualityTypesEnum(),
  isHdr: boolean("is_hdr").default(false).notNull(),
  softsub: varchar("softsub", { length: 255 }).array().default([]).notNull(),
  hardsub: varchar("hardsub", { length: 255 }).default("").notNull(),
  dubbed: varchar("dubbed", { length: 255 }).array().default([]).notNull(),
  country: varchar("country", { length: 255 }).default("").notNull(),
  seasonBoundary: integer("season_boundary").array().notNull(),
  episode: integer("episode"),
  season: integer("season"),
});

export const mediaSourcesRelations = relations(
  mediaSources,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [mediaSources.ownerId],
      references: [users.id],
    }),
    sources: many(sources),
    interactions: many(mediaSourceInteractions),
  }),
);

/* TABLE: subtitle_sources */
export const subtitleSources = createTable("subtitle_source", {
  id: varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", {
    mode: "date",
    withTimezone: true,
  }).notNull(),
  ownerId: varchar("owner_id", { length: 255 }).notNull(),
  imdbId: varchar("imdb_id", { length: 255 }).notNull(),
  protocol: varchar("protocol", { length: 255 }).notNull(),
  domain: varchar("domain", { length: 255 }).notNull(),
  pathname: varchar("pathname", { length: 255 }).notNull(),
  type: subSourceTypeEnum().default("subtitle").notNull(),
  mediaType: mediaTypeEnum().notNull(),
  translator: varchar("translator", { length: 255 }),
  language: varchar("language", { length: 255 }).notNull(),
  description: text("description"),
  roomId: varchar("room_id", { length: 255 }).notNull(),
  isPublic: boolean("is_public").default(false).notNull(),
  disabled: boolean("disabled").notNull(),
  canBePublic: boolean("can_be_public").notNull(),
  name: varchar("name", { length: 255 }).default("").notNull(),
  crossorigin: boolean("crossorigin").notNull(),
  seasonBoundary: integer("season_boundary").array().notNull(),
  episode: integer("episode"),
  season: integer("season"),
});

export const subtitleSourcesRelations = relations(
  subtitleSources,
  ({ one, many }) => ({
    owner: one(users, {
      fields: [subtitleSources.ownerId],
      references: [users.id],
    }),
    sources: many(sources),
  }),
);

/* TABLE: media_source_interactions */
export const mediaSourceInteractions = createTable(
  "media_source_interaction",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    userId: varchar("user_id", { length: 255 }).notNull(),
    mediaLinkId: varchar("media_link_id", { length: 255 }).notNull(),
    isLike: boolean("is_like").notNull(),
  },
  (table) => [
    unique("unique_user_media_link").on(table.userId, table.mediaLinkId),
  ],
);

export const mediaSourceInteractionsRelations = relations(
  mediaSourceInteractions,
  ({ one }) => ({
    mediaSource: one(mediaSources, {
      fields: [mediaSourceInteractions.mediaLinkId],
      references: [mediaSources.id],
    }),
    user: one(users, {
      fields: [mediaSourceInteractions.userId],
      references: [users.id],
    }),
  }),
);

/* TABLE: collections */
export const collections = createTable(
  "collection",
  {
    id: varchar("id", { length: 255 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: varchar("name", { length: 255 }).notNull(),
    uniqueName: varchar("unique_name", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", { mode: "date", withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", {
      mode: "date",
      withTimezone: true,
    }).notNull(),
    ownerId: varchar("owner_id", { length: 255 }).notNull(),
    visibility: visibilityEnum().notNull(),
    editable: boolean("editable").default(false).notNull(),
  },
  (table) => [
    unique("unique_owner_unique_name").on(table.ownerId, table.uniqueName),
  ],
);

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  owner: one(users, { fields: [collections.ownerId], references: [users.id] }),
  rooms: many(rooms),
}));
