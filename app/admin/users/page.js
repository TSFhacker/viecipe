import { options } from "@/app/api/auth/[...nextauth]/options";
import CustomTable from "@/components/layout/custom-table";
import { getAllRecipes } from "@/lib/recipes";
import { getAllUsers } from "@/lib/user";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminUsers() {
  const users = await getAllUsers();
  const session = await getServerSession(options);

  if (!session?.user.admin) redirect("/", "replace");

  return (
    <div>
      <CustomTable data={users} />
    </div>
  );
}
