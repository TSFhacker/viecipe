import MealsGrid from "@/components/meals/meals-grid";
import {
  getRecipesByDaytime,
  getRecipesByMealtype,
  getRecipesByOccasion,
  getRecipesByRegion,
} from "@/lib/recipes";
import classes from "./page.module.css";
import { Suspense } from "react";

async function CategorizedRecipes({ params }) {
  let recipes = [];
  switch (params.categoryName[0]) {
    case "occasion":
      recipes = await getRecipesByOccasion(params.categoryName[1]);
      break;
    case "region":
      recipes = await getRecipesByRegion(params.categoryName[1]);
      break;

    case "daytime":
      recipes = await getRecipesByDaytime(params.categoryName[1]);
      break;
    case "mealtype":
      recipes = await getRecipesByMealtype(params.categoryName[1]);
      break;
  }
  return <MealsGrid meals={recipes} />;
}

export default async function CategoryPage({ params }) {
  return (
    <div className={classes.category_container}>
      <h1>{decodeURIComponent(params.categoryName[1])}</h1>
      <Suspense>
        <CategorizedRecipes params={params} />
      </Suspense>
    </div>
  );
}
