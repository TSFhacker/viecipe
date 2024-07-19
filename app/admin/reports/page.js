import { options } from "@/app/api/auth/[...nextauth]/options";
import CustomTable from "@/components/layout/custom-table";
import { getAllReports } from "@/lib/reports";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function AdminRecipes() {
  const reports = await getAllReports();
  const session = await getServerSession(options);

  if (!session?.user.admin) redirect("/", "replace");

  console.log(reports);

  return <div>{<CustomTable data={reports} />}</div>;
}
