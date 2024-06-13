import Link from "next/link";
import classes from "./page.module.css";
import ImageSlideshow from "@/components/images/image-slideshow";

export default async function Home() {
  return (
    <>
      <header className={classes.header}>
        <div className={classes.slideshow}>
          <ImageSlideshow />
        </div>
        <div>
          <div className={classes.hero}>
            <h1>Khám phá ẩm thực Việt</h1>
            <p>Chia sẻ khắp 3 miền Việt Nam</p>
          </div>
          <div className={classes.cta}>
            <Link href="/community">Cộng đồng ẩm thực</Link>
            <Link href="/meals">Khám phá</Link>
          </div>
        </div>
      </header>
      <main>
        <section className={classes.section}>
          <h2>Cách dùng</h2>
          <p>
            Viecipe là nền tảng để chia sẻ các công thức nấu ăn Việt Name. Đây
            là nơi để khám phá món mới và kết nối với những tín đồ ẩm thực Việt.
          </p>
          <p>
            Đây là nơi để thử các món ăn mới lạ và tìm kiếm những người dùng
            chung sở thích.
          </p>
        </section>

        <section className={classes.section}>
          <h2>Tại sao lại là Viecipe?</h2>
          <p>
            Viecipe là nền tảng để chia sẻ các công thức nấu ăn Việt Name. Đây
            là nơi để khám phá món mới và kết nối với những tín đồ ẩm thực Việt.
          </p>
          <p>
            Đây là nơi để thử các món ăn mới lạ và tìm kiếm những người dùng
            chung sở thích.
          </p>
        </section>
      </main>
    </>
  );
}
