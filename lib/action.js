"use server";

import { redirect } from "next/navigation";
import { saveRecipe } from "./recipes";
import { revalidatePath } from "next/cache";
import { connectToDatabase } from "./db";

function isInvalidText(text) {
  if (typeof text === "string") return !text || text.trim() === "";
  else return false;
}

export async function shareRecipe(prevState, formData) {
  const client = await connectToDatabase();
  const db = client.db();

  // Search for a user document with the specified email
  const user = await db
    .collection("users")
    .findOne({ email: formData.get("email") });

  const ingredients = [];

  for (let i = 0; i < formData.getAll("ingredients").length; i++) {
    ingredients.push({
      ingredient: formData.getAll("ingredients")[i],
      amount: formData.getAll("amount")[i],
    });
  }

  const meal = {
    recipe_name: formData.get("title"),
    introduction: formData.get("summary"),
    instruction: formData.get("instructions"),
    image: formData.get("image"),
    dayTime: formData.getAll("dayTime"),
    meals: formData.getAll("meals"),
    occasions: formData.getAll("occasions"),
    regions: formData.getAll("regions"),
    provinces: formData.getAll("provinces"),
    ingredients: ingredients,
    people: parseInt(formData.get("people")),
    time: formData.get("time"),
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
