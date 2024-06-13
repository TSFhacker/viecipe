import { connectToDatabase } from "./db";

export const getBookmarksByUserId = async function (userId) {
  const client = await connectToDatabase();
  const db = client.db();

  const bookmarks = await db
    .collection("bookmarks")
    .aggregate([
      {
        $match: { userId: userId }, // Match bookmarks by userId
      },
      {
        $addFields: {
          recipeId: { $toObjectId: "$recipeId" }, // Convert recipeId from string to ObjectId
        },
      },
      {
        $lookup: {
          from: "recipes", // The collection to join with
          localField: "recipeId", // Field from the bookmarks collection
          foreignField: "_id", // Field from the recipes collection
          as: "recipe_info", // Output array field
        },
      },
      {
        $unwind: "$recipe_info", // Unwind the recipe_info array
      },
      {
        $addFields: {
          // Convert the 'user' field from string to ObjectId
          userId: { $toObjectId: "$userId" },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user_info",
        },
      },
    ])
    .toArray();

  const transformedBookmarks = bookmarks.map((bookmark) => ({
    ...bookmark,
    _id: bookmark._id.toString(),
    userId: bookmark.userId.toString(),
    recipeId: bookmark.recipeId.toString(),
    recipe_info: {
      ...bookmark.recipe_info,
      _id: bookmark.recipe_info._id.toString(),
    },
    ...bookmark.recipe_info,
    bookmarked: true,
  }));

  return transformedBookmarks;
};
