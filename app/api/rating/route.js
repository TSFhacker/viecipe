import { connectToDatabase } from "@/lib/db";
import { getRecipeById } from "@/lib/recipes";
import { findUserById } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const data = await req.json();
    const { userId, recipeId, rating } = data;
    const client = await connectToDatabase();
    const db = client.db();
    const rater = await findUserById(userId);
    const recipe = await getRecipeById(userId, recipeId);
    const recipe_owner = await findUserById(recipe[0].user);
    const existingRating = await db
      .collection("ratings")
      .findOne({ user_id: userId, recipe_id: recipeId });
    if (existingRating) {
      await db.collection("ratings").updateOne(
        { user_id: userId, recipe_id: recipeId },
        {
          $set: {
            rating: rating,
          },
        }
      );
      db.collection("notifications").insertOne({
        type: "rating",
        from: userId,
        to: recipe_owner._id.toString(),
        content: `${
          rater.name || rater.email
        } đã đánh giá ${rating} sao cho công thức của bạn"`,
        url: `/meals/${recipeId}`,
        status: "unread",
        created_at: new Date(),
      });
      revalidatePath(`/meals`);
      return NextResponse.json({ messsage: "Đánh giá thành công" });
    }

    const newRating = {
      user_id: userId,
      recipe_id: recipeId,
      rating: rating,
    };

    await db.collection("ratings").insertOne(newRating);
    db.collection("notifications").insertOne({
      type: "rating",
      from: userId,
      to: recipe_owner._id.toString(),
      content: `${
        rater.name || rater.email
      } đã đánh giá ${rating} sao cho công thức của bạn"`,
      url: `/meals/${recipeId}`,
      status: "unread",
      created_at: new Date(),
    });

    revalidatePath(`/meals`);
    return NextResponse.json({ messsage: "Đánh giá thành công" });
  } catch (error) {
    return NextResponse.json({ messsage: error.message });
  }
}

export { handler as POST };
