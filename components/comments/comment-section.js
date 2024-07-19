"use client";

import { useRef, useState } from "react";
import CommentCard from "./comment-card";
import classes from "./comment-section.module.css";
import { FaBookmark, FaFlag } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Select from "react-select";

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
  const [reportVisible, setReportVisible] = useState(false);
  const reportRef = useRef();

  const reportReasons = [
    { label: "Nội dung phản cảm", value: "Nội dung phản cảm" },
    { label: "Nội dung không liên quan", value: "Nội dung không liên quan" },
    {
      label: "Nội dung gây ảnh hưởng sức khỏe",
      value: "Nội dung gây ảnh hưởng sức khỏe",
    },
  ];

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

  const handleReport = async function (e) {
    e.preventDefault();
    const reasons = reportRef.current.getValue().map((reason) => reason.value);
    try {
      const response = await fetch("/api/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          reportedId: recipeId,
          type: "recipe",
          reason: reasons,
        }),
      });

      if (!response.ok) {
        throw new Error("Đường truyền không ổn định, hãy thử lại");
      }

      const data = await response.json();
      toast(data.message);
      setReportVisible(false);
    } catch (error) {
      toast(error.message);
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
        <>
          <FaFlag
            className={classes.report_icon}
            onClick={() => setReportVisible(true)}
          />
          <FaBookmark
            className={`${classes.bookmark} ${bookmark}`}
            onClick={handleBookmark}
          />
        </>
      )}
      {reportVisible && (
        <form className={classes.report} onSubmit={handleReport}>
          <h1>Báo cáo công thức này</h1>
          <div>
            <label htmlFor="reason">Nêu lý do</label>
            <Select
              name="reasons"
              isMulti
              options={reportReasons}
              placeholder="Nêu lý do"
              className={classes.multipleInput}
              ref={reportRef}
            />
            {/* <textarea rows={5} id="reason" ref={reportRef} required /> */}
          </div>
          <p onClick={() => setReportVisible(false)}>X</p>
          <button>Báo cáo</button>
        </form>
      )}
    </div>
  );
}
