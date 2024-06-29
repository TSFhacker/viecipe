import { ObjectId } from "mongodb";
import { connectToDatabase } from "./db";

export const getMessageHistory = async (userId1, userId2) => {
  const client = await connectToDatabase();
  const db = client.db();

  try {
    const messagesCollection = db.collection("messages");

    // Find all messages between userId1 and userId2
    const history = await messagesCollection
      .find({
        $or: [
          { senderId: userId1, recipientId: userId2 },
          { senderId: userId2, recipientId: userId1 },
        ],
      })
      .sort({ timestamp: 1 }) // Sort by timestamp ascending
      .toArray();

    // Map the history to ensure _id is returned as string
    return history.map((message) => ({
      ...message,
      _id: message._id.toString(), // Convert _id to string
    }));
  } catch (error) {
    console.error("Error fetching message history:", error);
    return []; // Return an empty array or handle the error as needed
  } finally {
    await client.close();
  }
};

export const getConversationList = async (currentUserId) => {
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db();

    if (typeof currentUserId !== "string") {
      currentUserId = currentUserId.toString();
    }

    // Retrieve messages involving the current user
    const messages = await db
      .collection("messages")
      .find({
        $or: [{ senderId: currentUserId }, { recipientId: currentUserId }],
      })
      .toArray();

    // Extract unique user IDs
    const userIds = new Set();
    messages.forEach((message) => {
      if (
        message.senderId !== currentUserId &&
        typeof message.senderId === "string"
      ) {
        userIds.add(message.senderId);
      }
      if (
        message.recipientId !== currentUserId &&
        typeof message.recipientId === "string"
      ) {
        userIds.add(message.recipientId);
      }
    });

    // Convert userIds to ObjectId
    const userObjectIds = Array.from(userIds).map((id) => new ObjectId(id));

    // Lookup user information
    const users = await db
      .collection("users")
      .find({
        _id: { $in: userObjectIds },
      })
      .toArray();

    // Aggregate unread message counts
    const unreadCounts = await db
      .collection("messages")
      .aggregate([
        {
          $match: {
            recipientId: currentUserId,
            status: "unread",
          },
        },
        {
          $group: {
            _id: "$senderId",
            count: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const unreadCountMap = new Map();
    unreadCounts.forEach((count) => {
      unreadCountMap.set(count._id.toString(), count.count);
    });

    // Combine user info and unread counts
    return users.map((user) => ({
      user_info: {
        _id: user._id.toString(),
        name: user.name,
        email: user.email,
        image: user.image,
      },
      unreadCount: unreadCountMap.get(user._id.toString()) || 0,
    }));
  } catch (error) {
    console.error("Error fetching conversation list:", error);
    return [];
  } finally {
    if (client) {
      await client.close();
    }
  }
};
