"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { ledgerTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth, currentUser } from "@clerk/nextjs/server";
import { sql } from "drizzle-orm";

const db = drizzle(process.env.DATABASE_URL!);

export async function addTransaction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const vendor = formData.get("vendor") as string;
  const description = formData.get("description") as string;
  const amount = parseInt(formData.get("amount") as string);
  const category = formData.get("category") as string;

  await db.insert(ledgerTable).values({
    userId,
    vendor,
    description,
    amount,
    category,
  });
}

export async function getTransactions() {
  const user = await currentUser();
  const userId = user!.id;
  const query = sql`
    SELECT
      *
    FROM
      ${ledgerTable}
    WHERE
      ${ledgerTable.userId} = ${userId}
    `;
  const data = await db.execute(query);
  return data.rows as (typeof ledgerTable.$inferSelect)[];
}

export async function deleteTransaction(id: number) {
  await db.delete(ledgerTable).where(eq(ledgerTable.id, id));
}

export async function getExpenses() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not authenticated");

  const query = sql`
    SELECT
      sum(amount) as total
    FROM
      ${ledgerTable}
    WHERE ${ledgerTable.userId} = ${userId}
    `;

  const data = await db.execute(query);
  return data.rows[0] as { total: number };
}
