import xss from "xss";
import { connectToDatabase } from "./db";
import { ObjectId } from "mongodb";
import slugify from "slugify";
import { S3 } from "@aws-sdk/client-s3";
import { getServerSession } from "next-auth";
import { getUserIdByEmail } from "./user";
import { getRatingAverage } from "./ratings";

const s3 = new S3({
  region: "ap-southeast-1",
});

export const getAllRecipes = async function () {
  const client = await connectToDatabase();
  const db = client.db();
  const recipeCollection = db.collection("recipes");
  const allRecipes = await recipeCollection
    .aggregate([
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
      {
        $sort: {
          created_at: -1,
        },
      },
      {
        $project: {
          userId: 0, // Exclude the userId field
        },
      },
    ])
    .toArray();

  // Convert all _id fields to strings
  const transformedRecipes = await Promise.all(
    allRecipes.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      user_info: recipe.user_info.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
      ratingAvg: await getRatingAverage(recipe._id.toString()),
    }))
  );

  return transformedRecipes;
};

export const getAllRecipesByFollowing = async function () {
  const client = await connectToDatabase();
  const db = client.db();

  const session = await getServerSession();
  const myUserId = await getUserIdByEmail(session.user.email);

  // Fetch the user IDs of people the current user is following
  const followsCollection = db.collection("follows");
  const following = await followsCollection
    .find({ followerId: myUserId })
    .toArray();

  const followingUserIds = following.map((follow) => follow.followedId);

  const recipeCollection = db.collection("recipes");
  const recipesByFollowing = await recipeCollection
    .aggregate([
      {
        $addFields: {
          // Convert the 'user' field from string to ObjectId
          userId: { $toObjectId: "$user" },
        },
      },
      {
        $match: {
          userId: {
            $in: followingUserIds.map((id) => ObjectId.createFromHexString(id)),
          },
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

  // Convert all _id fields to strings
  const transformedRecipes = await Promise.all(
    recipesByFollowing.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      user_info: recipe.user_info.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
      ratingAvg: await getRatingAverage(recipe._id),
    }))
  );

  return transformedRecipes;
};

export const getRecipesByUserId = async function (userId) {
  const client = await connectToDatabase();
  const db = client.db();
  const result = await db
    .collection("recipes")
    .aggregate([
      {
        $addFields: {
          userId: { $toObjectId: "$user" }, // Convert the 'user' field from string to ObjectId
        },
      },
      {
        $match: {
          userId: userId,
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

  const transformedResult = await Promise.all(
    result.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      userId: recipe.userId.toString(),
      user_info: recipe.user_info.map((user) => ({
        ...user,
        _id: user._id.toString(),
      })),
      ratingAvg: await getRatingAverage(recipe._id),
    }))
  );

  return transformedResult;
};

export const getRecipeById = async function (userId, recipeId) {
  const client = await connectToDatabase();
  const db = client.db();
  const objectId =
    typeof recipeId === "string"
      ? ObjectId.createFromHexString(recipeId)
      : recipeId;

  // Find the recipe by its ObjectId
  const result = await db
    .collection("recipes")
    .aggregate([
      {
        $addFields: {
          userId: { $toObjectId: "$user" }, // Convert the 'user' field from string to ObjectId
        },
      },
      {
        $match: { _id: objectId }, // Filter by recipe ID
      },
      {
        $lookup: {
          from: "users", // The collection to join with
          localField: "userId", // Field from the recipes collection
          foreignField: "_id", // Field from the users collection
          as: "user_info", // Output array field
        },
      },
      {
        $unwind: "$user_info", // Unwind the user_info array
      },
      {
        $lookup: {
          from: "bookmarks", // The collection to join with
          let: { recipeId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$userId", userId] },
                    { $eq: [{ $toObjectId: "$recipeId" }, "$$recipeId"] },
                  ],
                },
              },
            },
          ],
          as: "bookmarked",
        },
      },
      {
        $addFields: {
          bookmarked: { $gt: [{ $size: "$bookmarked" }, 0] },
        },
      },
    ])
    .toArray();

  const transformedResult = await Promise.all(
    result.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      userId: recipe.userId.toString(),
      user_info: {
        ...recipe.user_info,
        _id: recipe.user_info._id.toString(),
      },
      ratingAvg: await getRatingAverage(recipe._id),
    }))
  );

  console.log(transformedResult);

  return transformedResult;
};

export const saveRecipe = async function (meal) {
  // generate the slug
  meal.slug = slugify(meal.recipe_name, { lower: true });

  // sanitize the instructions
  meal.instruction = xss(meal.instruction);

  // get the extention
  const extension = meal.image.name.split(".").pop();

  // make a new file name
  const fileName = `${meal.slug}_${meal.user}.${extension}`;

  // // Create the destination to write our image to
  // const stream = fs.createWriteStream(`public/images/${fileName}`);

  // // save image using stream.write
  const bufferedImage = await meal.image.arrayBuffer();
  // stream.write(Buffer.from(bufferedImage), (error) => {
  //   if (error) {
  //     throw new Error("Saving image failed");
  //   }
  // });

  s3.putObject({
    Bucket: "dungbui1110-nextjs-foodies-image",
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  });

  meal.image = fileName;
  const client = await connectToDatabase();
  const db = client.db();
  const recipeCollection = db.collection("recipes");
  await recipeCollection.insertOne(meal);
};
