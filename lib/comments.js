import { connectToDatabase } from "./db";

export async function getCommentsByRecipeId(recipeId) {
  const client = await connectToDatabase();
  const db = client.db();

  const comments = await db
    .collection("comments")
    .aggregate([
      {
        $match: { recipe_id: recipeId },
      },
      {
        $addFields: {
          user_id_objectId: { $toObjectId: "$user_id" }, // Convert user_id from string to ObjectId
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id_objectId",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $unwind: "$user_info",
      },
      {
        $sort: { created_at: -1 }, // Sort comments by the created_at field in ascending order (1 for ascending, -1 for descending)
      },
      {
        $project: { user_id_objectId: 0 },
      },
    ])
    .toArray();

  return comments;
}
