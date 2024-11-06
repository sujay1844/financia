"use client";

import { useState, useEffect, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { addTransaction, getTransactions, deleteTransaction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Transaction = {
  id: number;
  vendor: string;
  description: string | null;
  amount: number;
  category: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Adding..." : "Add Transaction"}
    </Button>
  );
}

export default function FinanceTracker() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    fetchTransactions();
  }, []);

  async function fetchTransactions() {
    const fetchedTransactions = await getTransactions();
    setTransactions(fetchedTransactions);
  }

  async function handleAddTransaction(formData: FormData) {
    await addTransaction(formData);
    startTransition(() => {
      fetchTransactions();
    });
  }

  async function handleDelete(id: number) {
    await deleteTransaction(id);
    startTransition(() => {
      fetchTransactions();
    });
  }

  const totalExpenses = transactions.reduce(
    (sum, transaction) => sum + transaction.amount,
    0,
  );

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Personal Finance Tracker</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Total Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold text-primary">
            ${(totalExpenses / 100).toFixed(2)}
          </p>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Add New Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={handleAddTransaction}>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="vendor">Vendor</Label>
                  <Input id="vendor" name="vendor" required />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" name="amount" type="number" required />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" />
              </div>
            </div>
            <CardFooter className="px-0 pt-4">
              <SubmitButton />
            </CardFooter>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
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
                    <TableCell>
                      ${(transaction.amount / 100).toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.category}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
