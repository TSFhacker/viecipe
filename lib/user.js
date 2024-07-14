import { ObjectId } from "mongodb";
import { connectToDatabase } from "./db";
import { getServerSession } from "next-auth";

export const findUserByEmail = async function (email) {
  const client = await connectToDatabase();
  const db = client.db();

  const user = await db.collection("users").findOne({ email: email });

  return user;
};

export const findUserById = async function (userId, myUserId = null) {
  const client = await connectToDatabase();
  const db = client.db();

  const pipeline = [
    {
      $match: {
        _id:
          typeof userId === "string"
            ? ObjectId.createFromHexString(userId)
            : userId,
      },
    },
    {
      $lookup: {
        from: "follows",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$followedId", { $toString: "$$userId" }],
              },
            },
          },
        ],
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "follows",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$followerId", { $toString: "$$userId" }],
              },
            },
          },
        ],
        as: "following",
      },
    },
    {
      $lookup: {
        from: "recipes",
        let: { userId: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$user", "$$userId"],
              },
            },
          },
          {
            $count: "count",
          },
        ],
        as: "recipeCount",
      },
    },
    {
      $addFields: {
        followers: "$followers.followerId",
        following: "$following.followedId",
        recipeCount: {
          $ifNull: [{ $arrayElemAt: ["$recipeCount.count", 0] }, 0],
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        email: 1,
        admin: 1,
        followers: 1,
        following: 1,
        recipeCount: 1,
      },
    },
  ];

  if (myUserId) {
    pipeline.push({
      $lookup: {
        from: "follows",
        let: { followers: "$followers" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$followerId", myUserId],
                  },
                  {
                    $in: ["$followerId", "$$followers"],
                  },
                ],
              },
            },
          },
        ],
        as: "follow_by_me",
      },
    });
    pipeline.push({
      $addFields: {
        follow_by_me: { $gt: [{ $size: "$follow_by_me" }, 0] },
      },
    });
  }

  const result = await db.collection("users").aggregate(pipeline).toArray();

  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  return {
    ...user,
    _id: user._id.toString(),
    followers: user.followers.map((followerId) => followerId.toString()),
    following: user.following.map((followedId) => followedId.toString()),
    follow_by_me: user.follow_by_me || false,
  };
};
export const getUserIdByEmail = async function (email) {
  const user = await findUserByEmail(email);
  return user._id.toString();
};

export const getAllUsers = async function () {
  const client = await connectToDatabase();
  const db = client.db();

  const pipeline = [
    {
      $match: { admin: { $ne: true } },
    },
    {
      $lookup: {
        from: "follows",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$followedId", { $toString: "$$userId" }],
              },
            },
          },
        ],
        as: "followers",
      },
    },
    {
      $lookup: {
        from: "follows",
        let: { userId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$followerId", { $toString: "$$userId" }],
              },
            },
          },
        ],
        as: "following",
      },
    },
    {
      $addFields: {
        followers: "$followers.followerId",
        following: "$following.followedId",
      },
    },
    {
      $lookup: {
        from: "recipes",
        let: { userId: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$user", "$$userId"],
              },
            },
          },
        ],
        as: "recipes",
      },
    },
    {
      $addFields: {
        recipeCount: { $size: "$recipes" },
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        email: 1,
        admin: 1,
        status: 1,
        followers: 1,
        following: 1,
        recipeCount: 1,
      },
    },
  ];

  const result = await db.collection("users").aggregate(pipeline).toArray();

  const users = result.map((user) => ({
    ...user,
    _id: user._id.toString(),
    followers: user.followers.map((followerId) => followerId.toString()),
    following: user.following.map((followedId) => followedId.toString()),
  }));

  return users;
};

export const findUserWithNotifications = async (userId) => {
  // Call the findUserById function to get the user object
  const user = await findUserById(userId);

  if (!user) {
    return null;
  }

  // Connect to the database
  const client = await connectToDatabase();
  const db = client.db();

  // Query the notifications collection for this user
  const notifications = await db
    .collection("notifications")
    .find({ to: user._id.toString() })
    .sort({ created_at: -1 })
    .limit(10)
    .toArray();

  // Add the notifications to the user object
  user.notifications = notifications.map((notification) => ({
    ...notification,
    _id: notification._id.toString(),
    to: notification.to.toString(),
  }));

  return user;
};
