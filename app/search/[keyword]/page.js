import MealsGrid from "@/components/meals/meals-grid";
import searchKeyword from "@/lib/search";
import { getServerSession } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import defaultImage from "@/assets/default_profile.svg";
import classes from "./page.module.css";
import { Suspense } from "react";
import Loading from "@/app/meals/loading";

async function SearchResult({ params }) {
  const { recipes, users } = await searchKeyword(
    decodeURIComponent(params.keyword)
  );
  const session = await getServerSession();

  return (
    <>
      {users.length !== 0 ? (
        <div className={classes.users}>
          <h1>Danh sách người dùng</h1>
          {users.map((user) => (
            <div className={classes.single_user}>
              <Link href={`/profile/${user._id}`}>
                <Image
                  src={
                    user.image
                      ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${user.image}`
                      : defaultImage
                  }
                  alt={`ảnh đại diện của ${user.name}`}
                  width={200}
                  height={200}
                />
                <span>{user.name || user.email}</span>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <p>Không tìm thấy người dùng nào</p>
      )}
      {recipes.length !== 0 ? (
        <div className={classes.recipes}>
          <h1>Danh sách công thức</h1>
          <MealsGrid meals={recipes} session={session} />
        </div>
      ) : (
        <p>Không tìm thấy công thức nào</p>
      )}
    </>
  );
}

export default async function Search({ params }) {
  return (
    <div className={classes.search_container}>
      <Suspense fallback={<Loading />}>
        <SearchResult params={params} />
      </Suspense>
    </div>
  );
}
