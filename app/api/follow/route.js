import { connectToDatabase } from "@/lib/db";
import { findUserById, getUserIdByEmail } from "@/lib/user";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const data = await req.json();
    const { userId } = data;
    const session = await getServerSession();
    const myUserId = await getUserIdByEmail(session.user.email);
    const myUser = await findUserById(myUserId);

    if (req.method === "POST") {
      const newFollow = {
        followerId: myUserId,
        followedId: userId,
        createdAt: new Date(),
      };

      await db.collection("follows").insertOne(newFollow);
      db.collection("notifications").insertOne({
        type: "follow",
        from: myUserId,
        to: userId,
        content: `${myUser.name || myUser.email} đã bắt đầu theo dõi bạn`,
        url: `/profile/${myUserId}`,
        status: "unread",
        created_at: new Date(),
      });
      revalidatePath(`/profile/${userId}`);
      revalidatePath(`/meals`);
      return NextResponse.json({ message: "Follow successfully" });
    } else if (req.method === "DELETE") {
      const result = await db.collection("follows").deleteOne({
        followerId: myUserId,
        followedId: userId,
      });

      if (result.deletedCount === 1) {
        revalidatePath(`/profile/${userId}`);
        revalidatePath(`/meals`);
        return NextResponse.json({
          message: "Unfollow successfully",
        });
      } else {
        return NextResponse.json({ message: "Failed to unfollow" });
      }
    } else {
      return NextResponse.json(
        { message: "Method not allowed" },
        { status: 405 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export { handler as POST, handler as DELETE };
