"use client";

import { useEffect, useState } from "react";
import SideBar from "../side-bar/side-bar";
import MealItem from "./meal-item";
import classes from "./meals-grid.module.css";
import { usePathname } from "next/navigation";
import SortingComponent from "../sorting-component";
import ReactPaginate from "react-paginate";
import { useSocket } from "../context/socket-context";

export default function MealsGrid({
  meals,
  fypRecipes,
  bookmarked,
  session,
  filter,
}) {
  const { socket, messages, setMessages, userId } = useSocket();
  const [currentPage, setCurrentPage] = useState("fyp");
  const [displayRecipes, setDisplayRecipes] = useState(fypRecipes || meals);
  const [itemOffset, setItemOffset] = useState(0);
  const [provinces, setProvinces] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState(fypRecipes || meals);

  useEffect(() => {
    setFilteredRecipes(displayRecipes);
  }, [displayRecipes]);

  const dayTime = [
    { value: "Bữa sáng", label: "Bữa sáng" },
    { value: "Bữa trưa", label: "Bữa trưa" },
    { value: "Bữa tối", label: "Bữa tối" },
  ];

  const mealType = [
    { value: "Món chính", label: "Món chính" },
    { value: "Ăn nhẹ/Ăn vặt", label: "Ăn nhẹ/Ăn vặt" },
    { value: "Khai vị", label: "Khai vị" },
    { value: "Tráng miệng", label: "Tráng miệng" },
    { value: "Giải khát", label: "Giải khát" },
  ];

  const occasions = [
    { value: "Hội Xuân Núi Bà", label: "Hội Xuân Núi Bà" },
    { value: "Hội Đống Đa", label: "Hội Đống Đa" },
    { value: "Hội đền Hai Bà Trưng", label: "Hội đền Hai Bà Trưng" },
    { value: "Hội Chùa Hương", label: "Hội Chùa Hương" },
    { value: "Hội Chùa Đậu", label: "Hội Chùa Đậu" },
    { value: "Lễ hội đua Voi", label: "Lễ hội đua Voi" },
    { value: "Hội Lim", label: "Hội Lim" },
    { value: "Hội Côn Sơn", label: "Hội Côn Sơn" },
    { value: "Hội Phủ Dầy", label: "Hội Phủ Dầy" },
    { value: "Hội Chùa Thầy", label: "Hội Chùa Thầy" },
    { value: "Hội Chùa Tây Phương", label: "Hội Chùa Tây Phương" },
    { value: "Lễ hội Hoa Lư", label: "Lễ hội Hoa Lư" },
    { value: "Lễ hội Gò Tháp", label: "Lễ hội Gò Tháp" },
    { value: "Giỗ Tổ Hùng Vương", label: "Giỗ Tổ Hùng Vương" },
    { value: "Hội Đâm Trâu", label: "Hội Đâm Trâu" },
    { value: "Hội Gióng", label: "Hội Gióng" },
    { value: "Hội Bà Chúa Xứ", label: "Hội Bà Chúa Xứ" },
    { value: "Hội Lăng Lê Văn Duyệt", label: "Hội Lăng Lê Văn Duyệt" },
    { value: "Hội Chọi Trâu Đồ Sơn", label: "Hội Chọi Trâu Đồ Sơn" },
    { value: "Hội Nghinh Ông", label: "Hội Nghinh Ông" },
    { value: "Hội Côn Sơn - Kiếp Bạc", label: "Hội Côn Sơn - Kiếp Bạc" },
    { value: "Lễ Giáng Sinh", label: "Lễ Giáng Sinh" },
    { value: "Tết Nguyên Tiêu", label: "Tết Nguyên Tiêu" },
    { value: "Tết Hàn Thực", label: "Tết Hàn Thực" },
    { value: "Lễ Phục Sinh", label: "Lễ Phục Sinh" },
    { value: "Lễ Phật Đản", label: "Lễ Phật Đản" },
    { value: "Tết Đoan Ngọ", label: "Tết Đoan Ngọ" },
    {
      value: "Tết Trung nguyên / Lễ Vu-lan",
      label: "Tết Trung nguyên / Lễ Vu-lan",
    },
    { value: "Tết Trung Thu", label: "Tết Trung Thu" },
    { value: "Ngày Đưa Ông Táo Về Trời", label: "Ngày Đưa Ông Táo Về Trời" },
  ];

  const regions = [
    { value: "Đông Bắc Bộ", label: "Đông Bắc Bộ" },
    { value: "Tây Bắc Bộ", label: "Tây Bắc Bộ" },
    { value: "Đồng bằng sông Hồng", label: "Đồng bằng sông Hồng" },
    { value: "Bắc Trung Bộ", label: "Bắc Trung Bộ" },
    { value: "Nam Trung Bộ", label: "Nam Trung Bộ" },
    { value: "Tây Nguyên", label: "Tây Nguyên" },
    { value: "Đông Nam Bộ", label: "Đông Nam Bộ" },
    { value: "Tây Nam Bộ", label: "Tây Nam Bộ" },
  ];

  const northEast = [
    { value: "Hà Giang", label: "Hà Giang" },
    { value: "Cao Bằng", label: "Cao Bằng" },
    { value: "Bắc Kạn", label: "Bắc Kạn" },
    { value: "Lạng Sơn", label: "Lạng Sơn" },
    { value: "Tuyên Quang", label: "Tuyên Quang" },
    { value: "Thái Nguyên", label: "Thái Nguyên" },
    { value: "Phú Thọ", label: "Phú Thọ" },
    { value: "Bắc Giang", label: "Bắc Giang" },
    { value: "Quảng Ninh", label: "Quảng Ninh" },
  ];

  const northWest = [
    { value: "Lào Cai", label: "Lào Cai" },
    { value: "Lai Châu", label: "Lai Châu" },
    { value: "Yên Bái", label: "Yên Bái" },
    { value: "Điện Biên", label: "Điện Biên" },
    { value: "Sơn La", label: "Sơn La" },
    { value: "Hòa Bình", label: "Hòa Bình" },
  ];

  const redRiverDelta = [
    { value: "Hà Nội", label: "Hà Nội" },
    { value: "Hà Nam", label: "Hà Nam" },
    { value: "Bắc Ninh", label: "Bắc Ninh" },
    { value: "Hải Dương", label: "Hải Dương" },
    { value: "Hải Phòng", label: "Hải Phòng" },
    { value: "Hưng Yên", label: "Hưng Yên" },
    { value: "Nam Định", label: "Nam Định" },
    { value: "Ninh Bình", label: "Ninh Bình" },
    { value: "Thái Bình", label: "Thái Bình" },
    { value: "Vĩnh Phúc", label: "Vĩnh Phúc" },
  ];

  const northCentral = [
    { value: "Thanh Hoá", label: "Thanh Hoá" },
    { value: "Nghệ An", label: "Nghệ An" },
    { value: "Hà Tĩnh", label: "Hà Tĩnh" },
    { value: "Quảng Bình", label: "Quảng Bình" },
    { value: "Quảng Trị", label: "Quảng Trị" },
    { value: "Thừa Thiên-Huế", label: "Thừa Thiên-Huế" },
  ];

  const westCentral = [
    { value: "Đà Nẵng", label: "Đà Nẵng" },
    { value: "Quảng Nam", label: "Quảng Nam" },
    { value: "Quảng Ngãi", label: "Quảng Ngãi" },
    { value: "Bình Định", label: "Bình Định" },
    { value: "Phú Yên", label: "Phú Yên" },
    { value: "Khánh Hoà", label: "Khánh Hoà" },
    { value: "Ninh Thuận", label: "Ninh Thuận" },
    { value: "Bình Thuận", label: "Bình Thuận" },
  ];

  const taynguyen = [
    { value: "Kon Tum", label: "Kon Tum" },
    { value: "Gia Lai", label: "Gia Lai" },
    { value: "Đắk Lắk", label: "Đắk Lắk" },
    { value: "Đắk Nông", label: "Đắk Nông" },
    { value: "Lâm Đồng", label: "Lâm Đồng" },
  ];

  const southEast = [
    { value: "Bà Rịa – Vũng Tàu", label: "Bà Rịa – Vũng Tàu" },
    { value: "Bình Dương", label: "Bình Dương" },
    { value: "Bình Phước", label: "Bình Phước" },
    { value: "Đồng Nai", label: "Đồng Nai" },
    { value: "Tây Ninh", label: "Tây Ninh" },
    { value: "TP.HCM", label: "TP.HCM" },
  ];

  const southWest = [
    { value: "Vĩnh Long", label: "Vĩnh Long" },
    { value: "Tiền Giang", label: "Tiền Giang" },
    { value: "Trà Vinh", label: "Trà Vinh" },
    { value: "Sóc Trăng", label: "Sóc Trăng" },
    { value: "Long An", label: "Long An" },
    { value: "Kiên Giang", label: "Kiên Giang" },
    { value: "Hậu Giang", label: "Hậu Giang" },
    { value: "Đồng Tháp", label: "Đồng Tháp" },
    { value: "Cần Thơ", label: "Cần Thơ" },
    { value: "Cà Mau", label: "Cà Mau" },
    { value: "Bến Tre", label: "Bến Tre" },
    { value: "Bạc Liêu", label: "Bạc Liêu" },
    { value: "An Giang", label: "An Giang" },
  ];

  const itemsPerPage = 9;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = filteredRecipes.slice(itemOffset, endOffset);

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

  const dayTimeList = [];
  const occasionList = [];
  const mealtypeList = [];
  const regionList = [];
  const provinceList = [];

  const handleFilter = function () {
    const markedCheckbox = new Array(
      ...document.querySelectorAll('input[type="checkbox"]:checked')
    ).map((checkbox) => {
      return {
        type: checkbox.value,
        value: checkbox.closest("label").textContent,
      };
    });

    if (markedCheckbox.length === 0) {
      setFilteredRecipes(displayRecipes);
      return;
    }

    const provinceTempList = [];

    markedCheckbox.forEach((checkbox) => {
      switch (checkbox.type) {
        case "dayTime":
          dayTimeList.push(checkbox.value);
          break;
        case "occasion":
          occasionList.push(checkbox.value);
          break;
        case "mealtype":
          mealtypeList.push(checkbox.value);
          break;
        case "region":
          regionList.push(checkbox.value);
          regionList.forEach((region) => {
            switch (region) {
              case "Đông Bắc Bộ":
                provinceTempList.push(...northEast);
                break;
              case "Tây Bắc Bộ":
                provinceTempList.push(...northWest);
                break;
              case "Đồng bằng sông Hồng":
                provinceTempList.push(...redRiverDelta);
                break;
              case "Bắc Trung Bộ":
                provinceTempList.push(...northCentral);
                break;
              case "Nam Trung Bộ":
                provinceTempList.push(...westCentral);
                break;
              case "Tây Nguyên":
                provinceTempList.push(...taynguyen);
                break;
              case "Đông Nam Bộ":
                provinceTempList.push(...southEast);
                break;
              case "Tây Nam Bộ":
                provinceTempList.push(...southWest);
                break;
              default:
                break;
            }
          });
          break;
        case "province":
          provinceList.push(checkbox.value);
          break;
        default:
          break;
      }

      provinceTempList.sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });
      setProvinces(provinceTempList);

      setFilteredRecipes(
        displayRecipes.filter(
          (recipe) =>
            (dayTimeList.length === 0 ||
              haveCommonItems(recipe.dayTime, dayTimeList)) &&
            (occasionList.length === 0 ||
              haveCommonItems(recipe.occasions, occasionList)) &&
            (mealtypeList.length === 0 ||
              haveCommonItems(recipe.meals, mealtypeList)) &&
            (regionList.length === 0 ||
              haveCommonItems(recipe.regions, regionList)) &&
            (provinceList.length === 0 ||
              haveCommonItems(recipe.provinces, provinceList))
        )
      );
    });
    return;
  };

  const haveCommonItems = function (arr1, arr2) {
    return arr1 ? arr1.some((item) => arr2.includes(item)) : false;
  };

  const handleSorting = function (sortingType) {
    setFilteredRecipes((prevRecipes) => {
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
      {filteredRecipes.length !== 0 ? (
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
      <div className={classes.recipe_list}>
        <div>
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
        {filter && displayRecipes.length > 0 && (
          <div className={classes.filter}>
            <h2>Bữa trong ngày</h2>
            <ul>
              {dayTime.map((daytime) => (
                <li>
                  <label>
                    <input
                      type="checkbox"
                      onChange={handleFilter}
                      value={`dayTime`}
                    />
                    {`${daytime.label}`}
                  </label>
                </li>
              ))}
            </ul>
            <h2>Loại bữa</h2>
            <ul>
              {mealType.map((el) => (
                <li>
                  <label>
                    <input
                      type="checkbox"
                      onChange={handleFilter}
                      value={`mealtype`}
                    />
                    {`${el.label}`}
                  </label>
                </li>
              ))}
            </ul>
            <h2>Dịp</h2>
            <ul>
              {occasions.map((el) => (
                <li>
                  <label>
                    <input
                      type="checkbox"
                      onChange={handleFilter}
                      value={`occasion`}
                    />
                    {`${el.label}`}
                  </label>
                </li>
              ))}
            </ul>
            <h2>Vùng</h2>
            <ul>
              {regions.map((el) => (
                <li>
                  <label>
                    <input
                      type="checkbox"
                      onChange={handleFilter}
                      value={`region`}
                    />
                    {`${el.label}`}
                  </label>
                </li>
              ))}
            </ul>
            {provinces.length !== 0 && (
              <>
                <h2>Khu vực</h2>
                <ul>
                  {provinces.map((el) => (
                    <li>
                      <label>
                        <input
                          type="checkbox"
                          onChange={handleFilter}
                          value={`province`}
                        />
                        {`${el.label}`}
                      </label>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
