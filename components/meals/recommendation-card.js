import Image from "next/image";
import Link from "next/link";
import classes from "./recommendation-card.module.css";
import defaultProfile from "@/assets/default_profile.svg";
import { timeAgo } from "@/lib/helper";

export default function RecommendationCard({ info }) {
  return (
    <div className={classes.card_container}>
      <Image
        src={`https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${info.image}`}
        alt="anh do an"
        width={250}
        height={150}
      />
      <div className={classes.card_info}>
        <h2>{info.recipe_name}</h2>
        <Link
          href={`/profile/${info.user_info[0]._id}`}
          className={classes.user_info}
        >
          <Image
            src={
              info.user_info[0].image
                ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${info.user_info[0].image}`
                : defaultProfile
            }
            alt="anh dai dien"
            width={50}
            height={50}
            className={classes.profile_picture}
          />
          {info.user_info[0].name || info.user_info[0].email}
        </Link>

        <p className={classes.time}>{timeAgo(info.created_at)}</p>
        <div className={classes.actions}>
          <Link href={`/meals/${info._id}`}>Chi tiet</Link>
        </div>
      </div>
    </div>
  );
}
