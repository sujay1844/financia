import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { addTransaction } from "./actions";
import { revalidatePath } from "next/cache";
import { SubmitButton } from "./submit-button";

export async function NewTransaction() {
  async function handleAddTransaction(formData: FormData) {
    "use server";
    await addTransaction(formData);
    revalidatePath("/");
  }
  return (
    <Card>
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
  );
}
