"use server";

import { redirect } from "next/navigation";
import { saveRecipe } from "./recipes";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./db";

function isInvalidText(text) {
  return !text || text.trim() === "";
}

export async function shareRecipe(prevState, formData) {
  const client = await connectToDatabase();
  const db = client.db();

  // Search for a user document with the specified email
  const user = await db
    .collection("users")
    .findOne({ email: formData.get("email") });

  const meal = {
    recipe_name: formData.get("title"),
    introduction: formData.get("summary"),
    instruction: formData.get("instructions"),
    image: formData.get("image"),
    user: user._id.toString(),
    created_at: new Date(),
    updated_at: new Date(),
  };

  if (
    isInvalidText(meal.recipe_name) ||
    isInvalidText(meal.introduction) ||
    isInvalidText(meal.instruction) ||
    isInvalidText(meal.user) ||
    !meal.image ||
    meal.image.size === 0
  ) {
    return {
      message: "Invalid input.",
    };
  }
  await saveRecipe(meal);
  revalidatePath("/meals");
  redirect("/meals");
}
