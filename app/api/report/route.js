import { connectToDatabase } from "@/lib/db";
import { getRecipeById } from "@/lib/recipes";
import { findUserById } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const data = await req.json();
    const { userId, reportedId, type, reason } = data;
    const client = await connectToDatabase();
    const db = client.db();

    // Validate the type
    if (!["recipe", "user"].includes(type)) {
      throw new Error("Sai loại báo cáo");
    }

    // If type is "recipe", ensure the reportedId is a valid recipe
    if (type === "recipe") {
      const recipe = await getRecipeById(null, reportedId); // Assuming `getRecipeById` takes userId and recipeId
      if (!recipe) {
        throw new Error("Công thức không tồn tại");
      }
    }

    // If type is "user", ensure the reportedId is a valid user
    if (type === "user") {
      const user = await findUserById(reportedId);
      if (!user) {
        throw new Error("Người dùng không tồn tại");
      }
    }

    const newReport = {
      user_id: userId,
      reported_id: reportedId,
      type: type,
      reason: reason,
      created_at: new Date(),
    };

    await db.collection("reports").insertOne(newReport);

    revalidatePath(`/reports`);
    return NextResponse.json({ message: "Tố cáo thành công" });
  } catch (error) {
    return NextResponse.json({
      message: "Lỗi máy chủ, hãy thử lại sau ít phút",
    });
  }
}

export { handler as POST };
