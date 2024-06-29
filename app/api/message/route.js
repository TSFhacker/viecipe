const { getConversationList } = require("@/lib/messages");
const { NextResponse } = require("next/server");

export async function handler(req) {
  try {
    // Ensure you handle both GET and POST methods
    if (req.method !== "POST") {
      return NextResponse.json(
        { message: "Method Not Allowed" },
        { status: 405 }
      );
    }

    // Parse the request body
    const data = await req.json();
    const { userId } = data;

    // Validate the userId
    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
        { status: 400 }
      );
    }

    // Get the conversation list
    const convoList = await getConversationList(userId);

    const unreadMessagesCount = convoList.reduce(
      (accumulator, currentValue) => accumulator + currentValue.unreadCount,
      0
    );

    // console.log(convoList);
    // console.log(unreadMessagesCount);

    // Return the conversation list in the response
    return NextResponse.json(unreadMessagesCount);
  } catch (error) {
    // Handle errors and return an error response
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export { handler as POST };
