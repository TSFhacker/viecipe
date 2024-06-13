import { connectToDatabase } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const data = await req.json();
    const { userId, recipeId } = data;

    if (req.method === "POST") {
      const newBookmark = {
        userId: userId,
        recipeId: recipeId,
        createdAt: new Date(),
      };

      await db.collection("bookmarks").insertOne(newBookmark);
      revalidatePath(`/meals`);
      return NextResponse.json({ message: "Bookmark added successfully" });
    } else if (req.method === "DELETE") {
      const result = await db.collection("bookmarks").deleteOne({
        userId: userId,
        recipeId: recipeId,
      });

      if (result.deletedCount === 1) {
        revalidatePath(`/meals`);
        return NextResponse.json({
          message: "Successfully deleted the bookmark",
        });
      } else {
        return NextResponse.json({ message: "Failed to delete the bookmark" });
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
