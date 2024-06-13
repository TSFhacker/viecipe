import classes from "./page.module.css";
import MealsGrid from "@/components/meals/meals-grid";
import { Suspense } from "react";
import { getAllRecipes, getAllRecipesByFollowing } from "@/lib/recipes";
import { getServerSession } from "next-auth";
import { getUserIdByEmail } from "@/lib/user";
import { getBookmarksByUserId } from "@/lib/bookmark";
import Loading from "./loading";

async function Meals() {
  const session = await getServerSession();
  console.log(session);

  const recipes = await getAllRecipes();

  const fypRecipes = session ? await getAllRecipesByFollowing() : null;
  const userId = session ? await getUserIdByEmail(session.user.email) : null;
  const bookmarked = session ? await getBookmarksByUserId(userId) : null;

  return (
    <MealsGrid
      meals={recipes}
      fypRecipes={fypRecipes}
      bookmarked={bookmarked}
      session={{ ...session, userId }}
    />
  );
}

export default function MealsPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>Những món ăn nổi bật</h1>
      </header>
      <main className={classes.main}>
        <Suspense fallback={<Loading />}>
          <Meals />
        </Suspense>
      </main>
    </>
  );
}
