"use server";

import { drizzle } from "drizzle-orm/neon-http";
import { ledgerTable } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";

const db = drizzle(process.env.DATABASE_URL!);

export async function addTransaction(formData: FormData) {
  const user = await currentUser();
  const userId = user!.id;
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
  return await db
    .select()
    .from(ledgerTable)
    .where(eq(ledgerTable.userId, userId));
}

export async function deleteTransaction(id: number) {
  await db.delete(ledgerTable).where(eq(ledgerTable.id, id));
}
