import { connectToDatabase } from "./db";

export async function getCommentsByRecipeId(recipeId) {
  const client = await connectToDatabase();
  const db = client.db();

  const comments = await db
    .collection("comments")
    .aggregate([
      {
        $match: { recipe_id: recipeId }, // Optional: If you want to filter comments by recipe_id
      },
      {
        $addFields: {
          user_id_objectId: { $toObjectId: "$user_id" }, // Convert user_id from string to ObjectId
        },
      },
      {
        $lookup: {
          from: "users", // The collection to join with
          localField: "user_id_objectId", // Field from the "comments" collection (ObjectId version)
          foreignField: "_id", // Field from the "users" collection
          as: "user_info", // Name of the array field to add the joined data
        },
      },
      {
        $unwind: "$user_info", // Optional: If you want to destructure the joined array
      },
      {
        $sort: { created_at: -1 }, // Sort comments by the created_at field in ascending order (1 for ascending, -1 for descending)
      },
      {
        $project: { user_id_objectId: 0 }, // Optional: Exclude the intermediate field user_id_objectId
      },
    ])
    .toArray();

  return comments;
}
