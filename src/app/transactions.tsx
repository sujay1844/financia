import { currentUser } from "@clerk/nextjs/server";
import { deleteTransaction, getTransactions } from "./actions";
import { revalidatePath } from "next/cache";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export async function Transactions() {
  const user = await currentUser();
  if (!user) {
    throw new Error("Not authenticated");
  }
  const transactions = await getTransactions();

  async function handleDelete(formData: FormData) {
    "use server";
    const id = formData.get("id") as unknown as number;
    await deleteTransaction(id);
    revalidatePath("/");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vendor</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{transaction.vendor}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>${(transaction.amount / 100).toFixed(2)}</TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>
                  <form action={handleDelete}>
                    <input
                      hidden
                      readOnly
                      name="id"
                      type="number"
                      value={transaction.id}
                    />
                    <Button variant="destructive" type="submit">
                      Delete
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
