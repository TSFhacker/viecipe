import Image from "next/image";
import classes from "./page.module.css";
import { notFound } from "next/navigation";
import { getRecipeById } from "@/lib/recipes";
import dummyImage from "@/public/images/banhmy.jpeg";
import defaultProfile from "@/assets/default_profile.webp";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { getUserIdByEmail } from "@/lib/user";
import { getRating, getRatingAverage } from "@/lib/ratings";
import Stars from "@/components/ratings/stars";
import { getCommentsByRecipeId } from "@/lib/comments";
import CommentSection from "@/components/comments/comment-section";
import { BsFillPeopleFill } from "react-icons/bs";
import { IoTimeSharp } from "react-icons/io5";
import { FaRegCalendarAlt, FaClock, FaMapMarkedAlt } from "react-icons/fa";
import { options } from "@/app/api/auth/[...nextauth]/options";
import { timeAgo } from "@/lib/helper";
import RecommendationList from "@/components/meals/recommendation-list";

export async function generateMetadata({ params }) {
  const session = await getServerSession(options);
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

  meal[0].instruction = isJsonString(meal[0].instruction)
    ? JSON.parse(meal[0].instruction)
    : meal[0].instruction;

  typeof meal[0].instruction === "string" &&
    meal[0].instruction.replace(/\n/g, "<br/>");

  // Function to render Draft.js content as HTML
  const DraftContent = () => {
    const blocks = meal[0].instruction.blocks;

    let imageCount = 0;

    return blocks.map((block, index) => {
      switch (block.type) {
        case "header-one":
          return <h1 key={block.key}>{block.text}</h1>;
        case "header-two":
          return <h2 key={block.key}>{block.text}</h2>;
        case "header-three":
          return <h3 key={block.key}>{block.text}</h3>;
        case "unordered-list-item":
          return (
            <ul key={block.key}>
              <li>{block.text}</li>
            </ul>
          );
        case "ordered-list-item":
          return (
            <ol key={block.key}>
              <li>{block.text}</li>
            </ol>
          );
        case "blockquote":
          return <blockquote key={block.key}>{block.text}</blockquote>;
        case "code-block":
          return (
            <pre key={block.key}>
              <code>{block.text}</code>
            </pre>
          );
        case "atomic":
          // Handle atomic blocks (e.g., images)
          imageCount++;
          return meal[0].instruction.images.length ? (
            <Image
              src={`https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${
                meal[0].instruction.images[imageCount - 1]
              }`}
              alt="anh do an"
              width={700}
              height={500}
            />
          ) : (
            ""
          );
        default:
          // Default to paragraph for unstyled text
          return <p key={block.key}>{block.text}</p>;
      }
    });
  };

  function isJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

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
              <Image
                src={
                  meal[0].user_info.image
                    ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${meal[0].user_info.image}`
                    : defaultProfile
                }
                alt="Ảnh đại diện tác giả"
                width={50}
                height={50}
              />
              {meal[0].user_info.name || meal[0].user_info.email}
            </Link>
            {timeAgo(meal[0].created_at)}
          </p>
          <div className={classes.info}>
            <div>
              <svg
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
              <p>{ratingAvg}</p>
            </div>
            <div>
              <BsFillPeopleFill />
              <p>{meal[0].people || 4} người</p>
            </div>
            <div>
              <IoTimeSharp />
              <p>{meal[0].time || "30 phút"}</p>
            </div>
          </div>
          <div className={classes.tags}>
            {meal[0].dayTime && (
              <div>
                <FaClock />
                {meal[0].dayTime.map((time) => (
                  <Link href={`/search/${encodeURIComponent(time)}`} key={time}>
                    {time}
                  </Link>
                ))}
              </div>
            )}
            {meal[0].occasions && (
              <div>
                <FaRegCalendarAlt />
                {meal[0].occasions.map((occasion) => (
                  <Link
                    href={`/search/${encodeURIComponent(occasion)}`}
                    key={occasion}
                  >
                    {occasion}
                  </Link>
                ))}
              </div>
            )}
            {meal[0].regions && (
              <div>
                <FaMapMarkedAlt />
                <div>
                  {meal[0].regions.map((region) => (
                    <Link
                      href={`/search/${encodeURIComponent(region)}`}
                      key={region}
                    >
                      {region}
                    </Link>
                  ))}
                </div>
                {meal[0].provinces && (
                  <div>
                    {meal[0].provinces.map((province) => (
                      <Link
                        href={`/search/${encodeURIComponent(province)}`}
                        key={province}
                      >
                        {province}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className={classes.main_content}>
        <div className={classes.content}>
          <div className={classes.intro}>
            <h1>Giới thiệu món ăn</h1>
            {meal[0].introduction}

            {meal[0].ingredients && (
              <>
                <h1>Nguyên liệu</h1>
                {meal[0].ingredients.map((ingredient, index) => (
                  <p key={`${ingredient.ingredient}_${index}`}>
                    <Link href={`/search/${ingredient.ingredient}`}>
                      <strong>{ingredient.ingredient}</strong>
                    </Link>
                    :{ingredient.amount}
                  </p>
                ))}
              </>
            )}
          </div>
          {typeof meal[0].instruction === "string" ? (
            <p
              className={classes.instructions}
              dangerouslySetInnerHTML={{ __html: meal[0].instruction }}
            ></p>
          ) : (
            <div className={classes.instructions}>{<DraftContent />}</div>
          )}

          {session ? (
            <Stars
              ratingValue={ratingValue}
              userId={userId}
              recipeId={params.id}
            />
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
        </div>
        <RecommendationList
          ingredients={meal[0].ingredients}
          occasions={meal[0].occasions}
          regions={meal[0].regions}
          recipeId={meal[0]._id}
        />
      </main>
    </>
  );
}
