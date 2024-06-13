import { connectToDatabase } from "@/lib/db";
import { getRecipeById } from "@/lib/recipes";
import { findUserById } from "@/lib/user";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

async function handler(req) {
  try {
    const data = await req.json();
    const { userId } = data;
    const client = await connectToDatabase();
    const db = client.db();
    await db
      .collection("notifications")
      .updateMany({ to: userId }, { $set: { status: "read" } });

    // Revalidate the path
    revalidatePath(`/`);

    return NextResponse.json({
      message: "Add comment and update notifications successfully",
    });
  } catch (error) {
    return NextResponse.json({ messsage: error.message });
  }
}

export { handler as POST };
