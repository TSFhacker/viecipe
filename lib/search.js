import { getServerSession } from "next-auth";
import { connectToDatabase } from "./db";
import { getRatingAverage } from "./ratings";

export default async function searchKeyword(keyword) {
  const client = await connectToDatabase();
  const db = client.db();

  const session = await getServerSession();

  let recipes = await db
    .collection("recipes")
    .aggregate([
      {
        $match: {
          recipe_name: { $regex: keyword, $options: "i" },
        },
      },
      {
        $addFields: {
          // Convert the 'user' field from string to ObjectId
          userId: { $toObjectId: "$user" },
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

  // Convert ObjectId to string for user_info in recipes
  recipes = await Promise.all(
    recipes.map(async (recipe) => {
      if (recipe.user_info && recipe.user_info.length > 0) {
        recipe.user_info = recipe.user_info.map((user) => {
          return {
            ...user,
            _id: user._id.toString(),
          };
        });
      }
      return {
        ...recipe,
        _id: recipe._id.toString(),
        ratingAvg: await getRatingAverage(recipe._id.toString()),
      };
    })
  );

  // Fetch and process users
  let users = [];
  if (session) {
    users = await db
      .collection("users")
      .find({
        $and: [
          {
            $or: [
              { name: { $regex: keyword, $options: "i" } },
              { email: { $regex: keyword, $options: "i" } },
            ],
          },
          { email: { $ne: session.user.email } },
          { name: { $ne: session.user.name } },
        ],
      })
      .toArray();

    console.log(users);

    // Convert ObjectId to string for users
    users = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }));
  }

  return {
    recipes,
    users,
  };
}
