import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const cats = sqliteTable('cats', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  age: integer('age').notNull(),
  breed: text('breed').notNull(),
});