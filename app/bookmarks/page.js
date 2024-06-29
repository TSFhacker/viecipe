import classes from "./page.module.css";
import MealsGrid from "@/components/meals/meals-grid";
import { Suspense } from "react";
import { getBookmarksByUserId } from "@/lib/bookmark";
import { getServerSession } from "next-auth";
import { getUserIdByEmail } from "@/lib/user";

async function Meals() {
  const session = await getServerSession();
  const userId = await getUserIdByEmail(session.user.email);
  const userBookmarks = await getBookmarksByUserId(userId);

  return <MealsGrid meals={userBookmarks} />;
}

export default function BookmarksPage() {
  return (
    <>
      <header className={classes.header}>
        <h1>Những công thức đã lưu</h1>
      </header>
      <main className={classes.main}>
        <Suspense>
          <Meals />
        </Suspense>
      </main>
    </>
  );
}
