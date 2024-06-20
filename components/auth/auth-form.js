import { useState, useRef } from "react";
import classes from "./auth-form.module.css";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ImagePicker from "../meals/image-picker";

function AuthForm(props) {
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const password2InputRef = useRef();
  const userNameInputRef = useRef();
  const imageRef = useRef();
  const [isLogin, setIsLogin] = useState(true);
  const [profilePicture, setProfilePicture] = useState("default");

  const router = useRouter();
  function switchAuthModeHandler() {
    setIsLogin((prevState) => !prevState);
  }

  async function createUser(email, password, username, profilePicture) {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    formData.append("username", username);
    formData.append("profilePicture", profilePicture);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong!");
    }

    return data;
  }

  const signInAndRedirect = async function (enteredEmail, enteredPassword) {
    const result = await signIn("credentials", {
      redirect: false,
      email: enteredEmail,
      password: enteredPassword,
    });

    if (!result.error) {
      router.replace(`/${props.callbackUrl}`);
      return 200;
    } else return result.error;
  };

  async function submitHandler(event) {
    event.preventDefault();

    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    if (isLogin) {
      try {
        const result = await signInAndRedirect(enteredEmail, enteredPassword);
        if (result === 200) {
          toast("Đăng nhập thành công");
        } else toast(result);
      } catch (error) {
        toast(error.message);
      }
    } else {
      try {
        const enteredPassword2 = password2InputRef.current.value;
        const enteredImage = imageRef.current.files[0];
        if (enteredPassword !== enteredPassword2) {
          toast("Mật khẩu xác nhận không khớp");
          return;
        }
        const enteredUsername = userNameInputRef.current.value;
        const result = await createUser(
          enteredEmail,
          enteredPassword,
          enteredUsername,
          enteredImage
        );
        toast(result.message);
        signInAndRedirect(enteredEmail, enteredPassword);
      } catch (error) {
        console.log(error);
        toast(error.message);
      }
    }
  }

  return (
    <section className={classes.auth}>
      <ToastContainer />
      <h1>{isLogin ? "Đăng nhập" : "Đăng ký"}</h1>
      <form onSubmit={submitHandler}>
        <div className={classes.control}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" ref={emailInputRef} required />
        </div>
        {!isLogin && (
          <div className={classes.control}>
            <label htmlFor="username">Tên tài khoản</label>
            <input id="username" ref={userNameInputRef} required />
          </div>
        )}
        <div className={classes.control}>
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            ref={passwordInputRef}
            required
          />
        </div>
        {!isLogin && (
          <>
            <div className={classes.control}>
              <label htmlFor="password2">Xác nhận mật khẩu</label>
              <input
                type="password"
                id="password2"
                ref={password2InputRef}
                required
              />
            </div>
            <ImagePicker
              label="Chọn hình đại diện"
              name="hình đại diện"
              profilePicture={profilePicture}
              setProfilePicture={setProfilePicture}
              imageRef={imageRef}
            />
          </>
        )}
        <div className={classes.actions}>
          <button>{isLogin ? "Đăng nhập" : "Đăng ký"}</button>
          <button
            type="button"
            className={classes.toggle}
            onClick={switchAuthModeHandler}
          >
            {isLogin ? "Chưa có tài khoản?" : "Đã có tài khoản?"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default AuthForm;
