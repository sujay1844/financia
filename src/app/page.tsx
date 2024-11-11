import { currentUser } from "@clerk/nextjs/server";
import { Transactions } from "./transactions";
import { NewTransaction } from "./add-new-transaction";
import { Expenses } from "./expenses";

export default async function Home() {
  const user = await currentUser();
  if (!user) {
    return (
      <div className="flex items-center justify-center w-full h-72">
        <h1 className="text-6xl font-bold">Please sign in</h1>
      </div>
    );
  }

  return (
    <>
      <NewTransaction />
      <Expenses />
      <Transactions />
    </>
  );
}
