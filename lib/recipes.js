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

  // console.log(transformedResult);

  return transformedResult;
};

export const saveRecipe = async function (meal) {
  // Generate the slug
  meal.slug = slugify(meal.recipe_name, { lower: true });

  console.log("in recipes.js");
  // console.log(meal);
  meal.instruction = JSON.parse(meal.instruction);

  // Sanitize instruction if it's a string
  if (typeof meal.instruction === "string") {
    meal.instruction = xss(meal.instruction);
  } else {
    // Handle instruction if it's an object (likely Draft.js content)
    const instruction_images = [];
    console.log("it is not a string");
    console.log(meal.instruction.entityMap);
    meal.instruction.entityMap = Object.values(meal.instruction.entityMap);
    for (let i = 0; i < meal.instruction.entityMap.length; i++) {
      console.log("getting in the loop");
      const base64Data = meal.instruction.entityMap[i].data.src.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const buffer = Buffer.from(base64Data, "base64");
      const instruction_image_extension = getFileExtensionFromBase64(
        meal.instruction.entityMap[i].data.src
      );

      const imageKey = `${meal.user}_${meal.slug}_${i}.${instruction_image_extension}`;
      console.log(imageKey);

      // Upload image to S3
      await s3.putObject({
        Bucket: "dungbui1110-nextjs-foodies-image",
        Key: imageKey,
        Body: buffer,
        ContentType: getImageTypeFromBase64(
          meal.instruction.entityMap[i].data.src
        ),
      });

      instruction_images.push(imageKey);
    }

    meal.instruction = JSON.stringify({
      blocks: meal.instruction.blocks,
      images: instruction_images,
    });
    // console.log(meal.instruction);
  }

  // Upload main image to S3
  const fileName = `${meal.user}_${meal.slug}_thumbnail.${meal.image.name
    .split(".")
    .pop()}`;
  const bufferedImage = await meal.image.arrayBuffer();
  await s3.putObject({
    Bucket: "dungbui1110-nextjs-foodies-image",
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  }); // Ensure upload completes before proceeding

  meal.image = fileName;

  // Save to MongoDB
  const client = await connectToDatabase();
  const db = client.db();
  const recipeCollection = db.collection("recipes");
  await recipeCollection.insertOne(meal);

  // Close database connection
  client.close();
};

const getFileExtensionFromBase64 = (base64Data) => {
  const mime = base64Data.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
  if (mime && mime.length > 1) {
    const mimeType = mime[1];
    const extension = mimeType.split("/").pop(); // Get last part of MIME type (e.g., 'png')
    return extension;
  }
  return null; // Invalid data URI format or no extension found
};

const getImageTypeFromBase64 = (base64Data) => {
  const regex = /^data:(image\/[a-zA-Z]*);base64,/;
  const match = base64Data.match(regex);
  if (match && match.length > 1) {
    return match[1]; // Returns something like 'image/png' or 'image/jpeg'
  }
  return null; // Invalid data URI format or no image type found
};

export const getRecipesByRegions = async function (regions, recipeId) {
  const client = await connectToDatabase();
  const db = client.db();

  // Convert recipeId to ObjectId if it is a string
  const excludeObjectId =
    typeof recipeId === "string"
      ? ObjectId.createFromHexString(recipeId)
      : recipeId;

  const result = await db
    .collection("recipes")
    .aggregate([
      {
        $addFields: {
          matchedRegions: {
            $filter: {
              input: "$regions",
              as: "region",
              cond: { $in: ["$$region", regions] },
            },
          },
        },
      },
      {
        $match: {
          matchedRegions: { $ne: [] },
          _id: { $ne: excludeObjectId },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $unwind: "$user_info",
      },
    ])
    .toArray();

  const transformedResult = await Promise.all(
    result.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      userId: recipe.user.toString(),
      user_info: {
        ...recipe.user_info,
        _id: recipe.user_info._id.toString(),
      },
      ratingAvg: await getRatingAverage(recipe._id),
    }))
  );

  transformedResult.sort((a, b) => b.ratingAvg - a.ratingAvg);

  return transformedResult.slice(0, 4);
};

export const getRecipesByOccasions = async function (occasions, recipeId) {
  const client = await connectToDatabase();
  const db = client.db();

  // Convert recipeId to ObjectId if it is a string
  const excludeObjectId =
    typeof recipeId === "string"
      ? ObjectId.createFromHexString(recipeId)
      : recipeId;

  const result = await db
    .collection("recipes")
    .aggregate([
      {
        $addFields: {
          matchedOccasions: {
            $filter: {
              input: "$occasions",
              as: "occasion",
              cond: { $in: ["$$occasion", occasions] },
            },
          },
        },
      },
      {
        $match: {
          matchedOccasions: { $ne: [] },
          _id: { $ne: excludeObjectId },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $unwind: "$user_info",
      },
    ])
    .toArray();

  const transformedResult = await Promise.all(
    result.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      userId: recipe.user.toString(),
      user_info: {
        ...recipe.user_info,
        _id: recipe.user_info._id.toString(),
      },
      ratingAvg: await getRatingAverage(recipe._id),
    }))
  );

  transformedResult.sort((a, b) => b.ratingAvg - a.ratingAvg);

  return transformedResult.slice(0, 4);
};

export const getRecipesByIngredients = async function (ingredients, recipeId) {
  const client = await connectToDatabase();
  const db = client.db();

  // Extract ingredient names from the ingredients parameter
  const ingredientNames = ingredients.map(
    (ingredient) => ingredient.ingredient
  );

  // Convert recipeId to ObjectId if it is a string
  const excludeObjectId =
    typeof recipeId === "string"
      ? ObjectId.createFromHexString(recipeId)
      : recipeId;

  const result = await db
    .collection("recipes")
    .aggregate([
      {
        $addFields: {
          matchedIngredients: {
            $filter: {
              input: "$ingredients",
              as: "ingredient",
              cond: { $in: ["$$ingredient.ingredient", ingredientNames] },
            },
          },
        },
      },
      {
        $match: {
          matchedIngredients: { $ne: [] },
          _id: { $ne: excludeObjectId },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user_info",
        },
      },
      {
        $unwind: "$user_info",
      },
    ])
    .toArray();

  const transformedResult = await Promise.all(
    result.map(async (recipe) => ({
      ...recipe,
      _id: recipe._id.toString(),
      userId: recipe.user.toString(),
      user_info: {
        ...recipe.user_info,
        _id: recipe.user_info._id.toString(),
      },
      ratingAvg: await getRatingAverage(recipe._id),
    }))
  );

  transformedResult.sort((a, b) => b.ratingAvg - a.ratingAvg);

  return transformedResult.slice(0, 4);
};
