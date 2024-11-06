import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const ledgerTable = pgTable("ledger", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: varchar().notNull(),
  vendor: varchar().notNull(),
  description: varchar(),
  amount: integer().notNull(),
  category: varchar(),
});
