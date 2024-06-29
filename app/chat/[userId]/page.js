import Chat from "@/components/chat/chat";

export default function ChatPage({ params }) {
  return (
    <div>
      <Chat userId={params.userId} />
    </div>
  );
}
