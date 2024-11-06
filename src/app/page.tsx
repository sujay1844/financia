import { ledgerTable, usersTable } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";

const db = drizzle(process.env.DATABASE_URL!);

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="flex items-center justify-center w-full h-72">
        <h1 className="text-6xl font-bold">Please sign in</h1>
      </div>
    );
  }
  const data = await db
    .select()
    .from(ledgerTable)
    .where(eq(ledgerTable.userId, user.id))
    .execute();

  return (
    <>
      <h1 className="text-5xl">{user?.primaryEmailAddress?.emailAddress}</h1>
      <div>
        <h2 className="text-3xl">Your transactions</h2>
      </div>
    </>
  );
}
