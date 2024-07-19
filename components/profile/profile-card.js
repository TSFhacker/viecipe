"use client";

import Image from "next/image";
import "./profile-card.css";
import { getSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import defaultImage from "@/assets/default_profile.svg";
import { RiMessage2Fill } from "react-icons/ri";
import Link from "next/link";
import { FaFlag } from "react-icons/fa";
import Select from "react-select";

export default function ProfileCard({ user }) {
  const [authenticated, setAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [followedByMe, setFollowedByMe] = useState(
    user.follow_by_me ? "followed" : ""
  );
  const [followers, setFollowers] = useState(user.followers.length);
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

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        setAuthenticated(true);
        setCurrentUser(session.user);
      }
    });
  }, []);

  const handleFollow = async function () {
    try {
      if (!followedByMe) {
        fetch("/api/follow", {
          method: "POST",
          body: JSON.stringify({ userId: user._id }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setFollowedByMe("followed");
        setFollowers(followers + 1);
        toast("Đã theo dõi");
      } else {
        fetch("/api/follow", {
          method: "DELETE",
          body: JSON.stringify({ userId: user._id }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        setFollowedByMe("");
        setFollowers(followers - 1);
        toast("Đã bỏ theo dõi");
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
          userId: currentUser._id,
          reportedId: user._id,
          type: "user",
          reason: reasons,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      toast(data.message);
      setReportVisible(false);
    } catch (error) {
      console.error(error.message);
    }
  };

  return (
    <div className="custom-card custom-no-border">
      <ToastContainer />
      <div className="custom-card-body custom-little-profile">
        <div className="custom-pro-img">
          <Image
            src={
              user.image
                ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${user.image}`
                : defaultImage
            }
            alt="user"
            width={500}
            height={500}
          />
        </div>
        <h3 className="custom-m-b-0">{user.name || user.email}</h3>
        {authenticated && user.email !== currentUser?.email && (
          <div className="authenticated_actions">
            <button
              className={`custom-m-t-10 custom-btn custom-btn-primary custom-btn-md custom-btn-rounded ${followedByMe}`}
              onClick={handleFollow}
            >
              {followedByMe ? "Đã theo dõi" : "Theo dõi"}
            </button>
            <Link href={`/chat/${user._id}`}>
              <RiMessage2Fill />
            </Link>
            <FaFlag
              onClick={() => setReportVisible(true)}
              className="report_icon"
            />
          </div>
        )}
        <div className="custom-row text-center custom-m-t-20">
          <div className="custom-col-lg-4 custom-col-md-4 custom-m-t-20">
            <h3 className="custom-m-b-0 custom-font-light">
              {user.recipeCount}
            </h3>
            <small>Công thức</small>
          </div>
          <div className="custom-col-lg-4 custom-col-md-4 custom-m-t-20">
            <h3 className="custom-m-b-0 custom-font-light">{followers}</h3>
            <small>Người theo dõi</small>
          </div>
          <div className="custom-col-lg-4 custom-col-md-4 custom-m-t-20">
            <h3 className="custom-m-b-0 custom-font-light">
              {user.following.length}
            </h3>
            <small>Đang theo dõi</small>
          </div>
        </div>
      </div>
      {reportVisible && (
        <form className={`report`} onSubmit={handleReport}>
          <h1>Báo cáo công thức này</h1>
          <div>
            <label htmlFor="reason">Nêu lý do</label>
            <Select
              name="reasons"
              isMulti
              options={reportReasons}
              placeholder="Nêu lý do"
              className={`multipleInput`}
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
