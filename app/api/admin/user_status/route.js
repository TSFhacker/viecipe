import { connectToDatabase } from "@/lib/db";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const data = await req.json();
    const { userId, currentStatus } = data;

    if (req.method === "POST") {
      // Find the user by userId
      const user = await db
        .collection("users")
        .findOne({ _id: ObjectId.createFromHexString(userId) });

      if (!user) {
        return NextResponse.json(
          { message: "User not found" },
          { status: 404 }
        );
      }

      // Toggle the user's status between "active" and "blocked"
      const newStatus = currentStatus === "active" ? "blocked" : "active";

      await db
        .collection("users")
        .updateOne(
          { _id: ObjectId.createFromHexString(userId) },
          { $set: { status: newStatus } }
        );

      revalidatePath("/admin/users");

      return NextResponse.json({
        message:
          newStatus === "active"
            ? `Mở khóa người dùng thành công`
            : "Khóa người dùng thành công",
      });
    } else {
      return NextResponse.json(
        { message: "Lỗi hệ thống, xin hãy thử lại sau" },
        { status: 405 }
      );
    }
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export { handler as POST };
