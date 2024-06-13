"use client";

import ImagePicker from "@/components/meals/image-picker";
import classes from "./page.module.css";
import { shareRecipe } from "@/lib/action";
import MealsFormSubmit from "@/components/meals/meals-form-submit";
import { useFormState } from "react-dom";
import { getSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import "react-toastify/dist/ReactToastify.css";

export default function ShareMealPage() {
  const [state, formAction] = useFormState(shareRecipe, { message: null });
  const [email, setEmail] = useState("");
  const router = useRouter();
  const pathName = usePathname();
  useEffect(() => {
    getSession().then((session) => {
      console.log(session);
      if (!session) router.replace("/auth");
      setEmail(session.user.email);
    });
  }, [pathName]);

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
            <input type="text" id="title" name="title" required />
          </p>
          <p>
            <label htmlFor="summary">Mô tả ngắn gọn</label>
            <input type="text" id="summary" name="summary" required />
          </p>
          <p>
            <label htmlFor="instructions">Công thức</label>
            <textarea
              id="instructions"
              name="instructions"
              rows="10"
              required
            ></textarea>
          </p>
          <ImagePicker label="your image" name="image" />
          {state.message && <p>{state.message}</p>}
          <p className={classes.actions}>
            <MealsFormSubmit />
          </p>
        </form>
      </main>
    </>
  );
}
