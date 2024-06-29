import {
  getAllRecipes,
  getRecipesByIngredients,
  getRecipesByOccasions,
  getRecipesByRegions,
} from "@/lib/recipes";

import classes from "./recommendation-list.module.css";
import RecommendationCard from "./recommendation-card";

export default async function RecommendationList({
  occasions,
  regions,
  ingredients,
  recipeId,
}) {
  let allRecipes = [];
  const occasionsRecommendation = occasions
    ? await getRecipesByOccasions(occasions)
    : [];
  const regionsRecommendation = regions
    ? await getRecipesByRegions(regions)
    : [];
  const ingredientsRecommendation = ingredients
    ? await getRecipesByIngredients(ingredients)
    : [];

  const totalRecommendation =
    occasionsRecommendation.length +
    regionsRecommendation.length +
    ingredientsRecommendation.length;
  if (totalRecommendation < 10) {
    allRecipes = await getAllRecipes();
    allRecipes = allRecipes
      .sort((a, b) => b.ratingAvg - a.ratingAvg)
      .slice(0, 10 - totalRecommendation)
      .filter((recipe) => recipe._id != recipeId);

    console.log(allRecipes.length);
  }

  return (
    <div className={classes.rec_container}>
      {regionsRecommendation.length > 0 && (
        <div>
          <h2>Cùng khu vực</h2>
          {regionsRecommendation.map((rec) => (
            <RecommendationCard key={rec._id} info={rec} />
          ))}
        </div>
      )}
      {ingredientsRecommendation.length > 0 && (
        <div>
          <h2>Công thức với nguyên liệu tương tự</h2>
          {ingredientsRecommendation.map((rec) => (
            <RecommendationCard key={rec._id} info={rec} />
          ))}
        </div>
      )}

      {occasionsRecommendation.length > 0 && (
        <div>
          <h2>Các công thức cùng dịp</h2>
          {occasionsRecommendation.map((rec) => (
            <RecommendationCard key={rec._id} info={rec} />
          ))}
        </div>
      )}

      {allRecipes.length > 0 && (
        <div>
          <h2>Ngoài ra bạn có thể tham khảo</h2>
          {allRecipes.map((rec) => (
            <RecommendationCard key={rec._id} info={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
