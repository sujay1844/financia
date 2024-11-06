import { currentUser } from "@clerk/nextjs/server";
import FinanceTracker from "./finance-tracker";

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
      <FinanceTracker />
    </>
  );
}
