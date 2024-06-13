"use client";

import { useState } from "react";
import CommentCard from "./comment-card";
import classes from "./comment-section.module.css";
import { FaBookmark } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CommentSection({
  comments,
  userId,
  recipeId,
  email,
  bookmarked,
}) {
  const [commentList, setCommentList] = useState(comments);
  const [myComment, setMyComment] = useState("");
  const [bookmark, setBookmark] = useState(
    bookmarked ? classes.bookmarked : ""
  );

  console.log(bookmarked);
  const handleComment = function () {
    try {
      fetch("/api/comment", {
        method: "POST",
        body: JSON.stringify({ userId, recipeId, content: myComment }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      const newComment = {
        user_id: userId,
        recipe_id: recipeId,
        content: myComment,
        created_at: new Date(),
        updated_at: new Date(),
        user_info: {
          email: email,
        },
      };
      setCommentList([newComment, ...commentList]);
      setMyComment("");
      toast("Đã thêm bình luận");
    } catch (error) {
      alert(error.message);
    }
  };

  const handleBookmark = async function () {
    try {
      if (!bookmark) {
        fetch("/api/bookmark", {
          method: "POST",
          body: JSON.stringify({ userId, recipeId }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setBookmark(classes.bookmarked);
        toast("Đã lưu");
      } else {
        fetch("/api/bookmark", {
          method: "DELETE",
          body: JSON.stringify({ userId, recipeId }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setBookmark("");
        toast("Đã bỏ lưu");
      }
    } catch (error) {
      alert(error.message);
    }
  };
  return (
    <div className={classes.comment_section}>
      <ToastContainer />
      {userId && (
        <div className={classes.my_comment_container}>
          <textarea
            className={classes.my_comment}
            rows={5}
            placeholder="Bạn nghĩ sao về công thức này"
            onChange={(e) => setMyComment(e.target.value)}
            value={myComment}
          />
          <button className={classes.comment_button} onClick={handleComment}>
            Bình luận
          </button>
        </div>
      )}

      {commentList.map((comment) => (
        <CommentCard comment={comment} />
      ))}

      {userId && (
        <FaBookmark
          className={`${classes.bookmark} ${bookmark}`}
          onClick={handleBookmark}
        />
      )}
    </div>
  );
}
