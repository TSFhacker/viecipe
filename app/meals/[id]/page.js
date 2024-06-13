import Image from "next/image";
import classes from "./page.module.css";
import { notFound } from "next/navigation";
import { getRecipeById } from "@/lib/recipes";
import dummyImage from "@/public/images/banhmy.jpeg";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { getUserIdByEmail } from "@/lib/user";
import { getRating, getRatingAverage } from "@/lib/ratings";
import Stars from "@/components/ratings/stars";
import { getCommentsByRecipeId } from "@/lib/comments";
import CommentSection from "@/components/comments/comment-section";
import { FaBookmark } from "react-icons/fa";

export async function generateMetadata({ params }) {
  const session = await getServerSession();
  console.log(session);
  const userId = session ? await getUserIdByEmail(session.user.email) : null;
  const meal = await getRecipeById(userId, params.id);
  if (!meal) {
    notFound();
  }

  return {
    title: meal[0].recipe_name,
    description: meal[0].introduction,
  };
}

export default async function Meal({ params }) {
  const session = await getServerSession();
  const userId = session ? await getUserIdByEmail(session.user.email) : null;
  const meal = await getRecipeById(userId, params.id);
  let ratingValue = session ? await getRating(userId, params.id) : null;
  const ratingAvg = await getRatingAverage(params.id);
  ratingValue = ratingValue ? ratingValue.rating : 0;
  let comments = await getCommentsByRecipeId(params.id);
  comments.forEach((comment) => (comment._id = comment._id.toString()));

  if (!meal) {
    notFound();
  }

  meal[0].instruction = meal[0].instruction.replace(/\n/g, "<br/>");

  return (
    <>
      <header className={classes.header}>
        <div className={classes.image}>
          <Image
            src={
              meal[0].image
                ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${meal[0].image}`
                : dummyImage
            }
            fill
          />
        </div>
        <div className={classes.headerText}>
          <h1>{meal[0].recipe_name}</h1>
          <p className={classes.creator}>
            <Link href={`/profile/${meal[0].user_info._id}`}>
              {meal[0].user_info.email}
            </Link>
          </p>
          <p className={classes.summary}>{meal[0].introduction}</p>
          <p className={classes.summary}>
            {ratingAvg}
            <svg
              width="30px"
              height="34px"
              viewBox="0 0 60 64"
              xmlns="http://www.w3.org/2000/svg"
              className={classes.rating}
            >
              <path
                d="M31.3877 54.3698C30.3605 53.7883 29.1514 53.7883 28.1242 54.3698L14.9591 61.8221C12.1709 63.4004 9.03152 60.5493 9.78758 57.1254L12.8658 43.1853C13.1602 41.8524 12.8499 40.4411 12.0381 39.42L1.87657 26.6373C-0.148955 24.0893 1.28987 20.0181 4.3088 19.7551L18.4844 18.5206C19.8104 18.4051 20.9759 17.482 21.5262 16.1113L26.4342 3.88686C27.7305 0.658161 31.7813 0.658155 33.0776 3.88685L37.9856 16.1113C38.5359 17.482 39.7014 18.4051 41.0274 18.5206L55.203 19.7551C58.222 20.0181 59.6608 24.0893 57.6353 26.6373L47.4737 39.42C46.6619 40.4411 46.3517 41.8524 46.646 43.1853L49.7242 57.1254C50.4803 60.5493 47.3409 63.4004 44.5527 61.8221L31.3877 54.3698Z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </p>
        </div>
      </header>
      <main>
        <p
          className={classes.instructions}
          dangerouslySetInnerHTML={{ __html: meal[0].instruction }}
        ></p>
      </main>
      {session ? (
        <Stars ratingValue={ratingValue} userId={userId} recipeId={params.id} />
      ) : (
        <h1>Đăng nhập để xem đánh giá và bình luận</h1>
      )}
      <CommentSection
        comments={comments}
        userId={userId}
        recipeId={params.id}
        email={session?.user.email}
        bookmarked={meal[0].bookmarked}
      />
    </>
  );
}
