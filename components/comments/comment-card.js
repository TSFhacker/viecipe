import userPic from "@/public/images/user.jpg";
import Image from "next/image";
import classes from "./comment-card.module.css";
import { timeAgo } from "@/lib/helper";

export default function CommentCard({ comment }) {
  return (
    <div className={classes.comment_container}>
      <Image
        className={classes.profile_picture}
        src={userPic}
        width={200}
        height={200}
        alt="Profile picture"
      />
      <div className={classes.text_container}>
        <p className={classes.username}>{comment.user_info.email}</p>
        <div className={classes.content}>{comment.content}</div>
        <div className={classes.timestamp}>{timeAgo(comment.created_at)}</div>
      </div>
    </div>
  );
}
