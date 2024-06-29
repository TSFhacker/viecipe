import { options } from "@/app/api/auth/[...nextauth]/options";
import Chat from "@/components/chat/chat";
import { getConversationList, getMessageHistory } from "@/lib/messages";
import { findUserById } from "@/lib/user";
import { getServerSession } from "next-auth";

export default async function ChatPage({ params }) {
  const receiver = await findUserById(params.userId);
  const session = await getServerSession(options);
  const history = session
    ? await getMessageHistory(session.user._id, params.userId)
    : [];
  const convoList = session ? await getConversationList(session.user._id) : [];
  if (!convoList.find((convo) => convo.user_info._id === params.userId))
    convoList.push({ user_info: receiver, unreadCount: 0 });
  return (
    <div>
      <Chat
        userId={params.userId}
        receiverImage={receiver.image}
        username={receiver.name || receiver.email}
        history={history}
        convoList={convoList}
      />
    </div>
  );
}
