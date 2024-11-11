import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExpenses } from "./actions";

export async function Expenses() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  const { total: expenses } = await getExpenses();
  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Expenses</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold text-primary">
          ${(expenses / 100).toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
