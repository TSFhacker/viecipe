"use client";
import logoImg from "@/assets/logo.png";
import Link from "next/link";
import classes from "./main-header.module.css";
import Image from "next/image";
import MainHeaderBackground from "./main-header-background";
import NavLink from "./nav-link";
import { getSession, signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaSearch } from "react-icons/fa";
import defaultImage from "@/assets/default_profile.svg";
import { CiBellOn, CiMail } from "react-icons/ci";

import { timeAgo } from "@/lib/helper";
import Loading from "@/app/meals/loading";

export default function MainHeader() {
  const [loggedIn, setLoggedIn] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [admin, setAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdown, setDropdown] = useState(classes.hidden);
  const [notificationDropdown, setNotificationDropdown] = useState(
    classes.hidden
  );
  const [unread, setUnread] = useState(null);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);
  const router = useRouter();
  const pathName = usePathname();

  useEffect(() => {
    getSession().then(async (session) => {
      setLoggedIn(session ? true : false);
      session?.user.admin && setAdmin(true);
      setUser(session?.user || null);
      setUnread(
        session
          ? session.user.notifications.filter(
              (notification) => notification.status === "unread"
            ).length
          : null
      );

      if (session) {
        let result = await fetch("/api/message", {
          method: "POST",
          body: JSON.stringify({ userId: session.user._id }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        result = await result.json();
        setUnreadMessagesCount(result);
      }
    });
  }, [pathName]);

  const handleSignout = () => {
    toast("Đã đăng xuất");
    signOut();
    router.replace("/auth");
  };

  const handleSearch = async function () {
    if (!searchInput || searchInput.trim() === "") return;
    router.replace(`/search/${searchInput}`);
  };

  const handleCheckNotification = function () {
    notificationDropdown
      ? setNotificationDropdown("")
      : setNotificationDropdown(classes.hidden);
    if (unread > 0) {
      setUnread(0);
      fetch("/api/notification", {
        method: "POST",
        body: JSON.stringify({ userId: user._id.toString() }),
        headers: {
          "Content-Type": "application/json",
        },
      });
    }
  };

  const handleRedirectToChat = function () {
    router.replace("/chat/");
  };

  return (
    <>
      <MainHeaderBackground />
      <ToastContainer />
      <header className={classes.header}>
        <Link href="/" className={classes.logo}>
          <Image src={logoImg} alt="A plate with food on it" priority />
          Viecipe
        </Link>

        <div className={classes.search}>
          <input
            type="text"
            placeholder="Tìm công thức của bạn"
            onChange={(e) => setSearchInput(e.target.value)}
            value={searchInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
          />
          <FaSearch onClick={handleSearch} />
        </div>

        <nav className={classes.nav}>
          {user && (
            <>
              <CiMail
                onClick={handleRedirectToChat}
                className={classes.notification_icon}
              />
              {unreadMessagesCount > 0 && (
                <p className={classes.unreadMessages}>{unreadMessagesCount}</p>
              )}
              {!admin && (
                <>
                  <CiBellOn
                    onClick={handleCheckNotification}
                    className={classes.notification_icon}
                  />
                  {unread > 0 && <p className={classes.unread}>{unread}</p>}
                  <ul
                    className={`${classes.nav_notification} ${notificationDropdown}`}
                  >
                    {user.notifications?.map((notification) => (
                      <Link
                        href={notification.url}
                        className={
                          notification.status === "unread" &&
                          classes.unread_noti
                        }
                        onClick={() => setNotificationDropdown(classes.hidden)}
                      >
                        <li>
                          {notification.content.length > 50
                            ? notification.content.substring(0, 50) + "..."
                            : notification.content}

                          <p>{timeAgo(new Date(notification.created_at))}</p>
                        </li>
                      </Link>
                    ))}
                  </ul>
                </>
              )}
              <div className={classes.logged_in_menu}>
                <Image
                  src={
                    user.image
                      ? `https://dungbui1110-nextjs-foodies-image.s3.ap-southeast-1.amazonaws.com/${user.image}`
                      : defaultImage
                  }
                  alt="Ảnh đại diện"
                  width={30}
                  height={30}
                  className={classes.profile_picture}
                  onClick={() => {
                    dropdown ? setDropdown("") : setDropdown(classes.hidden);
                  }}
                />
              </div>
            </>
          )}
          {loggedIn !== null ? (
            <ul className={user && `${classes.nav_dropdown} ${dropdown}`}>
              {!admin && (
                <>
                  <li onClick={() => setDropdown(classes.hidden)}>
                    <NavLink href="/meals">Công thức</NavLink>
                  </li>
                  <li onClick={() => setDropdown(classes.hidden)}>
                    <NavLink href="/community">Cộng đồng</NavLink>
                  </li>
                </>
              )}
              {loggedIn && (
                <>
                  {!admin ? (
                    <>
                      <li onClick={() => setDropdown(classes.hidden)}>
                        <NavLink href="/profile">Hồ sơ</NavLink>
                      </li>
                      <li onClick={() => setDropdown(classes.hidden)}>
                        <NavLink href="/meals/share">Đăng công thức</NavLink>
                      </li>
                    </>
                  ) : (
                    <>
                      <li onClick={() => setDropdown(classes.hidden)}>
                        <NavLink href="/admin/users">Người dùng</NavLink>
                      </li>
                      <li onClick={() => setDropdown(classes.hidden)}>
                        <NavLink href="/admin/recipes">Công thức</NavLink>
                      </li>
                    </>
                  )}
                  <li onClick={() => setDropdown(classes.hidden)}>
                    <button className={classes.logout} onClick={handleSignout}>
                      Đăng xuất
                    </button>
                  </li>
                </>
              )}

              {loggedIn === false && !pathName.startsWith("/auth") && (
                <li>
                  <NavLink href={`/auth${pathName}`}>Đăng nhập</NavLink>
                </li>
              )}
            </ul>
          ) : (
            <Loading />
          )}
        </nav>
      </header>
    </>
  );
}
