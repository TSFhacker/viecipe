import classes from "./user-profile.module.css";
import ProfileCard from "./profile-card";
import MealsGrid from "../meals/meals-grid";
import { findUserByEmail } from "@/lib/user";
import { getRecipesByUserId } from "@/lib/recipes";
import { getServerSession } from "next-auth";
import Loading from "@/app/meals/loading";
import { Suspense } from "react";

async function Meals({ user }) {
  const currentUser = await findUserByEmail(user.email);
  const userRecipes = await getRecipesByUserId(currentUser._id);
  const session = await getServerSession();

  return <MealsGrid meals={userRecipes} session={session} />;
}

async function UserProfile({ user }) {
  // async function changePasswordHandler(passwordData) {
  //   const response = await fetch("/api/user/change-password", {
  //     method: "PATCH",
  //     body: JSON.stringify(passwordData),
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //   });

  //   const data = await response.json();
  // }

  return (
    <section className={classes.profile}>
      <ProfileCard user={user} />
      {/* <ProfileForm onChangePassword={changePasswordHandler} /> */}
      <Suspense fallback={<Loading />}>
        <Meals user={user} />
      </Suspense>
    </section>
  );
}

export default UserProfile;
