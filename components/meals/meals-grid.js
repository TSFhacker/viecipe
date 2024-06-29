"use client";

import { useState } from "react";
import SideBar from "../side-bar/side-bar";
import MealItem from "./meal-item";
import classes from "./meals-grid.module.css";
import { usePathname } from "next/navigation";
import SortingComponent from "../sorting-component";
import ReactPaginate from "react-paginate";
import { useSocket } from "../context/socket-context";

export default function MealsGrid({ meals, fypRecipes, bookmarked, session }) {
  const { socket, messages, setMessages, userId } = useSocket();
  console.log(socket, messages, userId);
  const [currentPage, setCurrentPage] = useState("fyp");
  const [displayRecipes, setDisplayRecipes] = useState(fypRecipes || meals);
  const [itemOffset, setItemOffset] = useState(0);

  const itemsPerPage = 9;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = displayRecipes.slice(itemOffset, endOffset);

  const pageCount = Math.ceil(displayRecipes.length / itemsPerPage);

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % displayRecipes.length;
    setItemOffset(newOffset);
  };

  const handleDisplayChange = function (display) {
    if (display === currentPage) return;
    setCurrentPage(display);
    if (display === "fyp") {
      setDisplayRecipes(fypRecipes);
    } else if (display === "discovery") {
      setDisplayRecipes(meals);
    } else setDisplayRecipes(bookmarked);
  };

  const handleSorting = function (sortingType) {
    setDisplayRecipes((prevRecipes) => {
      switch (sortingType) {
        case "newest":
          return prevRecipes.toSorted(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          );
        case "oldest":
          return prevRecipes.toSorted(
            (a, b) => new Date(a.created_at) - new Date(b.created_at)
          );
        case "best":
          return prevRecipes.toSorted(
            (a, b) => parseFloat(b.ratingAvg) - parseFloat(a.ratingAvg)
          );
        default:
          return prevRecipes; // Return the previous state if no sorting is applied
      }
    });
  };

  const pathName = usePathname();

  return (
    <div className={classes.meals_grid_container}>
      {displayRecipes.length !== 0 ? (
        <SortingComponent handleSorting={handleSorting} />
      ) : (
        <h1>Không có công thức nào</h1>
      )}
      {pathName.startsWith("/meals") && session?.userId && (
        <SideBar
          currentPage={currentPage}
          handleDisplayChange={handleDisplayChange}
        />
      )}
      <ul className={classes.meals}>
        {currentItems.map((meal) => (
          <li key={meal.id}>
            <MealItem {...meal} session={session} />
          </li>
        ))}
      </ul>
      <ReactPaginate
        className={classes.pagination_bar}
        breakLabel="..."
        nextLabel=">"
        onPageChange={handlePageClick}
        pageRangeDisplayed={5}
        pageCount={pageCount}
        previousLabel="<"
        renderOnZeroPageCount={null}
        activeClassName={classes.active_page}
      />
    </div>
  );
}
