"use client";

import { IoFilter } from "react-icons/io5";
import classes from "./sorting-component.module.css";
import { useState } from "react";

export default function SortingComponent({ handleSorting }) {
  const [dropdownVisibility, setDropdownVisibility] = useState(classes.hidden);

  const handleFilterDropdown = function () {
    setDropdownVisibility(dropdownVisibility ? "" : classes.hidden);
  };
  return (
    <div className={classes.icon_container}>
      <IoFilter
        className={classes.filter_icon}
        onClick={handleFilterDropdown}
      />
      <ul className={`${classes.dropdown} ${dropdownVisibility}`}>
        <li
          onClick={() => {
            setDropdownVisibility(classes.hidden);
            handleSorting("newest");
          }}
        >
          Sắp xếp theo ngày đăng mới nhất
        </li>
        <li
          onClick={() => {
            setDropdownVisibility(classes.hidden);
            handleSorting("oldest");
          }}
        >
          Sắp xếp theo ngày đăng cũ nhất nhất
        </li>
        <li
          onClick={() => {
            setDropdownVisibility(classes.hidden);
            handleSorting("best");
          }}
        >
          Sắp xếp theo lượt đánh giá giảm dần
        </li>
      </ul>
    </div>
  );
}
