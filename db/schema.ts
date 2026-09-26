import { pgTable, text, timestamp, boolean, uuid, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// --- Better Auth Tables ---

export const user = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull(),
  image: text('image'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const session = pgTable('session', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at').notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at'),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at').notNull(),
  updatedAt: timestamp('updated_at').notNull(),
})

export const verification = pgTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at'),
  updatedAt: timestamp('updated_at'),
})

// --- Application Domain Tables ---

export const categories = pgTable('categories', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

export const channels = pgTable('channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  category_id: uuid('category_id')
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  poster_url: text('poster_url'),
  banner_url: text('banner_url'),
  source_url: text('source_url').notNull(),
  is_active: boolean('is_active').default(true),
  is_streaming: boolean('is_streaming').default(true),
  quality: text('quality').default('HD'),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
})

export const externalSettings = pgTable('external_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  key: text('key').notNull(),
  value: jsonb('value').notNull(),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('external_settings_user_key_idx').on(table.user_id, table.key),
])

export const externalChannels = pgTable('external_channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  user_id: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  external_id: text('external_id').notNull(),
  name: text('name').notNull(),
  is_active: boolean('is_active').default(true),
  created_at: timestamp('created_at', { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
}, (table) => [
  uniqueIndex('external_channels_user_external_id_idx').on(table.user_id, table.external_id),
])

// --- Relations ---

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  categories: many(categories),
  channels: many(channels),
  externalSettings: many(externalSettings),
  externalChannels: many(externalChannels),
}))

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  user: one(user, {
    fields: [categories.user_id],
    references: [user.id],
  }),
  channels: many(channels),
}))

export const channelsRelations = relations(channels, ({ one }) => ({
  user: one(user, {
    fields: [channels.user_id],
    references: [user.id],
  }),
  category: one(categories, {
    fields: [channels.category_id],
    references: [categories.id],
  }),
}))

// --- Types ---

export type User = typeof user.$inferSelect
export type Session = typeof session.$inferSelect
export type Category = typeof categories.$inferSelect
export type Channel = typeof channels.$inferSelect
export type ExternalSetting = typeof externalSettings.$inferSelect
export type ExternalChannel = typeof externalChannels.$inferSelect
