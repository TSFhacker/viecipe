import UserProfile from "@/components/profile/user-profile";
import { findUserById, getUserIdByEmail } from "@/lib/user";
import { getServerSession } from "next-auth";

export default async function ProfilePage({ params }) {
  const session = await getServerSession();
  const userId = session ? await getUserIdByEmail(session.user.email) : null;
  const user = await findUserById(params.id, userId);
  return <UserProfile user={user} />;
}
