"use client";

import classes from "./side-bar.module.css";
import { IoPersonSharp } from "react-icons/io5";
import { FiCompass } from "react-icons/fi";
import { CiBookmark } from "react-icons/ci";
import { useState } from "react";

export default function SideBar({ currentPage, handleDisplayChange }) {
  const [hovered, setHovered] = useState(false);
  return (
    <ul
      className={classes.sidebar}
      onMouseOver={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <li
        onClick={() => handleDisplayChange("fyp")}
        className={currentPage === "fyp" && classes.current}
      >
        <IoPersonSharp />
        {hovered && "Của tôi"}
      </li>
      <li
        onClick={() => handleDisplayChange("discovery")}
        className={currentPage === "discovery" && classes.current}
      >
        <FiCompass /> {hovered && "Khám phá"}
      </li>
      <li
        onClick={() => handleDisplayChange("bookmarks")}
        className={currentPage === "bookmarks" && classes.current}
      >
        <CiBookmark /> {hovered && "Đã lưu"}
      </li>
    </ul>
  );
}
