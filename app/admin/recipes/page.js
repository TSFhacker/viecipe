import { options } from "@/app/api/auth/[...nextauth]/options";
import CustomTable from "@/components/layout/custom-table";
import { getAllRecipes } from "@/lib/recipes";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminRecipes() {
  const recipes = await getAllRecipes();
  const session = await getServerSession(options);

  if (!session?.user.admin) redirect("/", "replace");

  return (
    <div>
      <CustomTable data={recipes} />
    </div>
  );
}
