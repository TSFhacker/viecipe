import UserProfile from "@/components/profile/user-profile";
import { findUserByEmail, findUserById, getUserIdByEmail } from "@/lib/user";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const session = await getServerSession();
  if (!session) redirect("/auth", "replace");

  const userId = await getUserIdByEmail(session.user.email);
  const user = await findUserById(userId);
  return <UserProfile user={user} />;
}
