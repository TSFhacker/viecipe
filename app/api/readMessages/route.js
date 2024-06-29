const { NextResponse } = require("next/server");
const { connectToDatabase } = require("@/lib/db");

export async function handler(req) {
  let client;

  try {
    if (req.method === "POST") {
      // Handle POST requests (e.g., updating message status)
      const data = await req.json();
      const { recipientId, senderId } = data;

      // Validate the recipientId and senderId
      if (!recipientId || !senderId) {
        return NextResponse.json(
          { message: "Recipient ID and Sender ID are required" },
          { status: 400 }
        );
      }

      // Connect to the database
      client = await connectToDatabase();
      const db = client.db();

      // Update messages in the database
      const result = await db.collection("messages").updateMany(
        {
          recipientId: recipientId,
          senderId: senderId,
          status: "unread",
        },
        {
          $set: { status: "read" },
        }
      );

      // Return the update result
      return NextResponse.json({
        message: "Messages updated successfully",
        modifiedCount: result.modifiedCount,
      });
    } else {
      // Return a 405 Method Not Allowed response for other methods
      return NextResponse.json(
        { message: "Method Not Allowed" },
        { status: 405 }
      );
    }
  } catch (error) {
    // Handle errors and return an error response
    return NextResponse.json({ message: error.message }, { status: 500 });
  } finally {
    // Ensure the client connection is closed
    if (client) {
      await client.close();
    }
  }
}

export { handler as POST };
