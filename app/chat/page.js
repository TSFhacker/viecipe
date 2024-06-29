import { options } from "@/app/api/auth/[...nextauth]/options";
import Chat from "@/components/chat/chat";
import { getConversationList, getMessageHistory } from "@/lib/messages";
import { findUserById } from "@/lib/user";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function DefaultChatPage() {
  const session = await getServerSession(options);
  if (!session) redirect("/auth");
  const convoList = session ? await getConversationList(session.user._id) : [];
  redirect(`/chat/${convoList[0].user_info._id}`);
}
