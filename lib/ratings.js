import { connectToDatabase } from "./db";

export const getRating = async function (userId, recipeId) {
  const client = await connectToDatabase();
  const db = client.db();
  const rating = await db
    .collection("ratings")
    .findOne({ user_id: userId, recipe_id: recipeId });

  return rating;
};

export const getRatingAverage = async function (recipeId) {
  if (typeof recipeId !== "string") recipeId = recipeId.toString();
  const client = await connectToDatabase();
  const db = client.db();
  const allRatings = await db
    .collection("ratings")
    .find({ recipe_id: recipeId })
    .toArray();

  const ratingSum = allRatings.reduce(
    (accumulator, currentValue) => accumulator + currentValue.rating,
    0
  );
  const ratingAvg = ratingSum / allRatings.length;
  return ratingAvg ? ratingAvg.toFixed(1) : 0;
};
