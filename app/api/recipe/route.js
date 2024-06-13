import { connectToDatabase } from "@/lib/db";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

async function handler(req) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    const data = await req.json();
    const { recipeId } = data;

    if (req.method === "DELETE") {
      // Find the recipe by recipeId
      const recipe = await db
        .collection("recipes")
        .findOne({ _id: ObjectId.createFromHexString(recipeId) });

      if (!recipe) {
        return NextResponse.json(
          { message: "Recipe not found" },
          { status: 404 }
        );
      }

      // Delete the recipe
      await db
        .collection("recipes")
        .deleteOne({ _id: ObjectId.createFromHexString(recipeId) });

      return NextResponse.json({ message: "Xóa công thức thành công" });
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

export { handler as DELETE };
