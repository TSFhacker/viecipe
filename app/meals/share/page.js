"use client";

import ImagePicker from "@/components/meals/image-picker";
import classes from "./page.module.css";
import { shareRecipe } from "@/lib/action";
import MealsFormSubmit from "@/components/meals/meals-form-submit";
import { useFormState } from "react-dom";
import { getSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import "react-toastify/dist/ReactToastify.css";
// import MyEditor from "@/components/upload/my-editor";
import dynamic from "next/dynamic";
import Select from "react-select";
import { CiCircleMinus, CiCirclePlus } from "react-icons/ci";

const dayTime = [
  { value: "Bữa sáng", label: "Bữa sáng" },
  { value: "Bữa trưa", label: "Bữa trưa" },
  { value: "Bữa tối", label: "Bữa tối" },
];

const meals = [
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

const MyEditor = dynamic(() => import("@/components/upload/my-editor"), {
  ssr: false,
});

export default function ShareMealPage() {
  const [state, formAction] = useFormState(shareRecipe, { message: null });
  const [email, setEmail] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [ingredientCount, setIngredientCount] = useState([0]);
  const router = useRouter();
  const pathName = usePathname();
  useEffect(() => {
    getSession().then((session) => {
      console.log(session);
      if (!session) router.replace("/auth");
      setEmail(session.user.email);
    });
  }, [pathName]);

  const showSpecificRegion = function (e) {
    const regions = e.map((region) => region.value);
    const provinceList = [];
    regions.forEach((region) => {
      switch (region) {
        case "Đông Bắc Bộ":
          provinceList.push(...northEast);
          break;
        case "Tây Bắc Bộ":
          provinceList.push(...northWest);
          break;
        case "Đồng bằng sông Hồng":
          provinceList.push(...redRiverDelta);
          break;
        case "Bắc Trung Bộ":
          provinceList.push(...northCentral);
          break;
        case "Nam Trung Bộ":
          provinceList.push(...westCentral);
          break;
        case "Tây Nguyên":
          provinceList.push(...taynguyen);
          break;
        case "Đông Nam Bộ":
          provinceList.push(...southEast);
          break;
        case "Tây Nam Bộ":
          provinceList.push(...southWest);
          break;
        default:
          break;
      }
      provinceList.sort((a, b) => {
        if (a.label < b.label) {
          return -1;
        }
        if (a.label > b.label) {
          return 1;
        }
        return 0;
      });

      setProvinces(provinceList);
    });
  };

  const addIngredient = function () {
    setIngredientCount([...ingredientCount, 0]);
  };

  const subtractIngredient = function () {
    setIngredientCount(ingredientCount.filter((data, idx) => idx !== 0));
  };

  return (
    <>
      <header className={classes.header}>
        <h1>
          Chia sẻ
          <span className={classes.highlight}>
            {" "}
            công thức yêu thích của bạn
          </span>
        </h1>
        <p>hoặc bất kì công thức nào mà bạn muốn</p>
      </header>
      <main className={classes.main}>
        <form className={classes.form} action={formAction}>
          <p>
            <input
              id="email"
              name="email"
              required
              type="hidden"
              value={email}
            />
          </p>
          <p>
            <label htmlFor="title">Tên món ăn</label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="Món này gọi là ..."
              required
            />
          </p>
          <p>
            <label htmlFor="summary">Mô tả ngắn gọn</label>
            <input
              type="text"
              id="summary"
              name="summary"
              placeholder="Giới thiệu ngắn gọn"
              required
            />
          </p>
          <div>
            <label htmlFor="dayTime">Thời điểm trong ngày</label>
            <Select
              name="dayTime"
              isMulti
              options={dayTime}
              placeholder="Ăn lúc ..."
              className={classes.mutipleInput}
            />
          </div>

          <div>
            <label htmlFor="meals">Loại bữa</label>
            <Select
              name="meals"
              isMulti
              options={meals}
              placeholder="Loại bữa ..."
              className={classes.mutipleInput}
            />
          </div>

          <div>
            <label htmlFor="occasions">Dịp</label>
            <Select
              name="occasions"
              isMulti
              options={occasions}
              placeholder="Nhân dịp ..."
              className={classes.mutipleInput}
            />
          </div>

          <div>
            <label htmlFor="regions">Vùng</label>
            <Select
              name="regions"
              isMulti
              options={regions}
              className={classes.mutipleInput}
              placeholder="Món này ở vùng ..."
              onChange={showSpecificRegion}
              onMenuClose={(e) => console.log(this)}
            />
          </div>

          <div>
            <label htmlFor="provinces">Tỉnh</label>
            <Select
              name="provinces"
              isMulti
              options={provinces}
              placeholder="Cụ thể là ở ..."
              className={classes.mutipleInput}
            />
          </div>

          <div className={classes.ingredient}>
            <div>
              <label htmlFor="ingredients">Nguyên liệu</label>
              {ingredientCount.map(() => (
                <input
                  type="text"
                  id="ingredients"
                  name="ingredients"
                  placeholder="Nguyên liệu cần là ..."
                  required
                />
              ))}
            </div>
            <div>
              <label htmlFor="amount">Số lượng</label>
              {ingredientCount.map(() => (
                <input
                  type="text"
                  id="amount"
                  name="amount"
                  placeholder="Hãy ghi cụ thể đơn vị"
                  required
                />
              ))}
            </div>
            <div>
              <CiCirclePlus
                className={classes.addIcon}
                onClick={addIngredient}
              />
              <CiCircleMinus
                className={classes.addIcon}
                onClick={subtractIngredient}
              />
            </div>
          </div>

          <div>
            <label htmlFor="instructions">Công thức</label>

            <MyEditor />
          </div>
          <div className={classes.extraInfo}>
            <p>
              <label htmlFor="people">Số lượng người ăn</label>
              <input
                type="text"
                id="people"
                name="people"
                placeholder="Số người ăn là ..."
                required
              />
            </p>
            <p>
              <label htmlFor="time">Thời gian chế biến</label>
              <input
                type="text"
                id="time"
                name="time"
                placeholder="Chế biến mất khoảng ..."
                required
              />
            </p>
          </div>
          <ImagePicker label="Ảnh bìa" name="image" />
          {state.message && <p>{state.message}</p>}
          <p className={classes.actions}>
            <MealsFormSubmit />
          </p>
        </form>
      </main>
    </>
  );
}
