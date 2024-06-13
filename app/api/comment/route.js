import { connectToDatabase } from "@/lib/db";
import { getRecipeById } from "@/lib/recipes";
import { findUserById } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const data = await req.json();
    const { userId, recipeId, content } = data;
    const client = await connectToDatabase();
    const db = client.db();
    const recipe = await getRecipeById(userId, recipeId);
    const recipe_owner = await findUserById(recipe[0].user);
    const commenter = await findUserById(userId);
    const newComment = {
      user_id: userId,
      recipe_id: recipeId,
      content: content,
      created_at: new Date(),
      updated_at: new Date(),
    };

    await db.collection("comments").insertOne(newComment);
    db.collection("notifications").insertOne({
      type: "comment",
      from: userId,
      to: recipe_owner._id.toString(),
      content: `${
        commenter.name || commenter.email
      } đã bình luận vào công thức của bạn: "${content}"`,
      url: `/meals/${recipeId}`,
      status: "unread",
      created_at: new Date(),
    });

    revalidatePath(`/meals/${recipeId}`);
    return NextResponse.json({ messsage: "Add comment successfully" });
  } catch (error) {
    return NextResponse.json({ messsage: error.message });
  }
}

export { handler as POST };
