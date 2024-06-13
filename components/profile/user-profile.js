import classes from "./user-profile.module.css";
import ProfileCard from "./profile-card";
import MealsGrid from "../meals/meals-grid";
import { findUserByEmail } from "@/lib/user";
import { getRecipesByUserId } from "@/lib/recipes";
import { getServerSession } from "next-auth";

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

  const currentUser = await findUserByEmail(user.email);

  const userRecipes = await getRecipesByUserId(currentUser._id);
  const session = await getServerSession();
  return (
    <section className={classes.profile}>
      <ProfileCard user={user} />
      {/* <ProfileForm onChangePassword={changePasswordHandler} /> */}
      <MealsGrid meals={userRecipes} session={session} />
    </section>
  );
}

export default UserProfile;
