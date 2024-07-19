import { connectToDatabase } from "@/lib/db";

export const getAllReports = async function () {
  const client = await connectToDatabase();
  const db = client.db();
  const reportCollection = db.collection("reports");

  const allReports = await reportCollection
    .aggregate([
      {
        $addFields: {
          userId: {
            $cond: {
              if: { $eq: [{ $type: "$user_id" }, "string"] },
              then: { $toObjectId: "$user_id" },
              else: "$user_id",
            },
          },
          reportedId: {
            $cond: {
              if: { $eq: [{ $type: "$reported_id" }, "string"] },
              then: { $toObjectId: "$reported_id" },
              else: "$reported_id",
            },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "reporter",
        },
      },
      {
        $unwind: {
          path: "$reporter",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $facet: {
          userReports: [
            {
              $match: { type: "user" },
            },
            {
              $lookup: {
                from: "users",
                localField: "reportedId",
                foreignField: "_id",
                as: "reported",
              },
            },
            {
              $unwind: {
                path: "$reported",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
          recipeReports: [
            {
              $match: { type: "recipe" },
            },
            {
              $lookup: {
                from: "recipes",
                localField: "reportedId",
                foreignField: "_id",
                as: "reported",
              },
            },
            {
              $unwind: {
                path: "$reported",
                preserveNullAndEmptyArrays: true,
              },
            },
          ],
        },
      },
      {
        $project: {
          allReports: { $concatArrays: ["$userReports", "$recipeReports"] },
        },
      },
      {
        $unwind: "$allReports",
      },
      {
        $replaceRoot: { newRoot: "$allReports" },
      },
      {
        $project: {
          reportedId: 0,
          userId: 0,
        },
      },
      {
        $sort: {
          created_at: -1,
        },
      },
    ])
    .toArray();

  // Convert all _id fields to strings
  const reports = allReports.map((report) => ({
    ...report,
    _id: report._id.toString(),
    reporter: report.reporter
      ? { ...report.reporter, _id: report.reporter._id.toString() }
      : null,
    reported: report.reported
      ? { ...report.reported, _id: report.reported._id.toString() }
      : null,
  }));

  return reports;
};
