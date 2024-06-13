import { hashPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { S3 } from "@aws-sdk/client-s3";
import formidable from "formidable";
import { NextResponse } from "next/server";

const s3 = new S3({
  region: "ap-southeast-1",
});

async function handler(req) {
  if (req.method !== "POST") {
    return NextResponse.json({ message: "Invalid input" }, { status: 422 });
  }

  try {
    const formData = await req.formData();
    const email = formData.get("email");
    const password = formData.get("password");
    const username = formData.get("username");
    const profilePicture = formData.get("profilePicture");

    if (
      !email ||
      !email.includes("@") ||
      !password ||
      password.trim().length < 7
    ) {
      return NextResponse.json(
        {
          message: "Mật khẩu cần lớn hơn 7 ký tự",
        },
        { status: 422 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db();

    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return NextResponse.json(
        { message: "Tên tài khoản đã tồn tại" },
        { status: 422 }
      );
    }

    const hashedPassword = await hashPassword(password);

    let fileName = "";

    if (profilePicture) {
      // get the extension
      const extension = profilePicture.name.split(".").pop();

      // make a new file name
      fileName = `${email}_profile_picture.${extension}`;

      // read the file as a buffer
      const bufferedImage = await profilePicture.arrayBuffer();

      await s3.putObject({
        Bucket: "dungbui1110-nextjs-foodies-image",
        Key: fileName,
        Body: Buffer.from(bufferedImage),
        ContentType: profilePicture.type,
      });
    }

    await db.collection("users").insertOne({
      email,
      password: hashedPassword,
      name: username,
      image: fileName,
      admin: false,
      status: "active",
      created_at: new Date(),
    });

    return NextResponse.json(
      { message: "Đăng ký thành công" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { message: "Lỗi hệ thống, xin hãy thử lại sau ít phút" },
      { status: 500 }
    );
  }
}

export { handler as POST };
