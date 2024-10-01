/**
 * The code snippet below is an example.
 */

import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  email: text("email").primaryKey(),
  createdAt: text("created_at"),
});

export const wishlists = sqliteTable("wishlists", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userEmail: text("user_email").references(() => users.email),
  productSku: text("product_sku"),
  addedAt: text("added_at"),
});
