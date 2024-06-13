const sql = require("better-sqlite3");
const db = sql("meals.db");

const dummyMeals = [
  {
    title: "Bánh mỳ kiểu Tây",
    slug: "banh-my-kieu-tay",
    image: "burger.jpg",
    summary: "Món ăn lạ miệng với thịt bò và phô mai, cùng với vỏ bánh mềm.",
    instructions: `
      1. Chuẩn bị thịt bò:
         Mix 200g of ground beef with salt and pepper. Form into a patty.

      2. Chiên viên thịt:
         Hâm nóng một chảo với một ít dầu. Chiên viên thịt trong khoảng 2-3 phút mỗi mặt, cho đến khi vàng.

      3. Lắp ráp bánh burger:
         Rang vỏ bánh burger. Đặt rau xà lách và cà chua vào một nửa dưới. Thêm viên thịt đã chiên và phủ một lát phô mai.

      4. Phục vụ:
         Hoàn thành việc lắp ráp với nửa trên và phục vụ nóng.
    `,
    creator: "John Doe",
    creator_email: "johndoe@example.com",
  },
  {
    title: "Cà ri cay",
    slug: "cari-cay",
    image: "curry.jpg",
    summary:
      "Một loại cà ri giàu và cay, thấm vào với các loại gia vị kỳ lạ và sữa dừa kem.",
    instructions: `
      1. Sắp xếp rau củ:
         Cắt rau củ theo ý muốn thành từng miếng nhỏ.

      2. Xào rau củ:
         Trong một chảo với dầu, xào rau củ cho đến khi chúng bắt đầu mềm.

      3. Thêm bột cà ri:
         Khuấy đều 2 muỗng canh bột cà ri và nấu thêm khoảng một phút nữa.

      4. Sôi với sữa dừa:
         Rót vào 500ml sữa dừa và đun sôi. Để nấu trong khoảng 15 phút.

      5. Phục vụ:
         Thưởng thức cà ri kem này với cơm hoặc bánh mì.
    `,
    creator: "Max Schwarz",
    creator_email: "max@example.com",
  },
  {
    title: "Bánh xèo tự làm",
    slug: "banh-xeo-tu-lam",
    image: "dumplings.jpg",
    summary: "Bánh xèo mềm mại với nhân thịt và rau củ, được hấp hoàn hảo.",
    instructions: `
      1. Chuẩn bị nhân:
         Trộn thịt băm, rau củ băm nhỏ và gia vị.

      2. Làm bánh xèo:
         Đặt một muỗng nhân ở giữa mỗi tấm bánh xèo. Ướt mép và gấp lại để kín.

      3. Hấp bánh xèo:
         Sắp xếp bánh xèo trong nồi hấp. Hấp trong khoảng 10 phút.

      4. Phục vụ:
         Thưởng thức bánh xèo nóng, kèm theo sốt chấm theo sở thích của bạn.
    `,
    creator: "Emily Chen",
    creator_email: "emilychen@example.com",
  },
  {
    title: "Mì và Phô mai truyền thống",
    slug: "mi-va-pho-mai-truyen-thong",
    image: "macncheese.jpg",
    summary:
      "Mì kem và phô mai, một món truyền thống an ủi luôn khiến mọi người hài lòng.",
    instructions: `
      1. Nấu mì:
         Luộc mì theo hướng dẫn trên bao bì cho đến khi chín vừa.

      2. Chuẩn bị sốt phô mai:
         Trên một cái chảo, tan bơ, thêm bột và dần dần khuấy vào sữa cho đến khi sệt. Khuấy vào phô mai đã nghiền cho đến khi tan.

      3. Kết hợp:
         Trộn sốt phô mai với mì đã rửa sạch.

      4. Nướng:
         Chuyển vào một đĩa nướng, rắc một lớp bột mì phía trên và nướng cho đến khi vàng.

      5. Phục vụ:
         Phục vụ nóng, trang trí với mùi húng quế nếu muốn.
    `,
    creator: "Laura Smith",
    creator_email: "laurasmith@example.com",
  },
  {
    title: "Pizza chân thành",
    slug: "pizza-chan-thanh",
    image: "pizza.jpg",
    summary:
      "Pizza thôi bỏ tay với sốt cà chua chua cay, các loại nguyên liệu tươi mới và phô mai tan chảy.",
    instructions: `
      1. Chuẩn bị bột:
         Nhồi bột pizza và để nở đến khi gấp đôi kích thước.

      2. Tạo hình và thêm nguyên liệu:
         Lăn bột ra, phết sốt cà chua, và thêm các loại nguyên liệu yêu thích và phô mai.

      3. Nướng pizza:
         Nướng trong lò đã được làm nóng ở 220°C khoảng 15-20 phút.

      4. Phục vụ:
         Cắt lát nóng và thưởng thức với một ít lá húng quế.
    `,
    creator: "Mario Rossi",
    creator_email: "mariorossi@example.com",
  },
  {
    title: "Wiener Schnitzel",
    slug: "wiener-schnitzel",
    image: "schnitzel.jpg",
    summary: "Bánh rán veal giòn vàng, một món ăn kinh điển của Áo.",
    instructions: `
      1. Chuẩn bị thịt veal:
         Đập mỗi miếng veal để cùng độ dày.

      2. Bọc thịt veal:
         Lăn mỗi miếng thịt trong bột, nhúng vào trứng đánh, và sau đó trong bột mì.

      3. Chiên schnitzel:
         Làm nóng dầu trong một chảo và chiên mỗi miếng schnitzel cho đến khi vàng đều hai mặt.

      4. Phục vụ:
         Phục vụ nóng với một lát chanh và một phần salad khoai tây hoặc rau xanh.
    `,
    creator: "Franz Huber",
    creator_email: "franzhuber@example.com",
  },
  {
    title: "Salad cà chua tươi",
    slug: "salad-ca-chua-tuoi",
    image: "tomato-salad.jpg",
    summary:
      "Một loại salad nhẹ và sảng khoái với cà chua chín, húng quế tươi và sốt dầu giấm chua.",
    instructions: `
      1. Chuẩn bị cà chua:
        Cắt cà chua tươi thành lát và sắp xếp chúng trên một đĩa.

      2. Thêm các loại thảo mộc và gia vị:
         Rắc húng quế cắt nhỏ, muối và tiêu lên trên cà chua.

      3. Rưới sốt cho salad:
         Rưới một ít dầu ô liu và giấm balsamic.

      4. Phục vụ:
         Thưởng thức món salad đơn giản, đậm đà này như một món ăn phụ hoặc bữa ăn nhẹ.
    `,
    creator: "Sophia Green",
    creator_email: "sophiagreen@example.com",
  },
];

db.prepare(
  `
   CREATE TABLE IF NOT EXISTS meals (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
       slug TEXT NOT NULL UNIQUE,
       title TEXT NOT NULL,
       image TEXT NOT NULL,
       summary TEXT NOT NULL,
       instructions TEXT NOT NULL,
       creator TEXT NOT NULL,
       creator_email TEXT NOT NULL
    )
`
).run();

async function initData() {
  const stmt = db.prepare(`
      INSERT INTO meals VALUES (
         null,
         @slug,
         @title,
         @image,
         @summary,
         @instructions,
         @creator,
         @creator_email
      )
   `);

  for (const meal of dummyMeals) {
    stmt.run(meal);
  }
}

initData();
