import { verifyPassword } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import { findUserWithNotifications, getUserIdByEmail } from "@/lib/user";
import CredentialsProvider from "next-auth/providers/credentials";
import { revalidatePath } from "next/cache";

export const options = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: {
          label: "Username: ",
          type: "text",
          placeholder: "your-cool-username",
        },
        password: {
          label: "Password:",
          type: "password",
          placeholder: "your-awesome-password",
        },
      },
      async authorize(credentials) {
        const client = await connectToDatabase();

        const usersCollection = client.db().collection("users");

        const user = await usersCollection.findOne({
          email: credentials.email,
        });
        if (!user) {
          client.close();
          throw new Error("Tên tài khoản không đúng");
        }

        if (user.status === "blocked") {
          client.close();
          throw new Error(
            "Tài khoản này đang bị khóa, hãy liên hệ quản trị viên"
          );
        }

        const isValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isValid) {
          client.close();
          throw new Error("Sai mật khẩu");
        }
        client.close();
        revalidatePath("/meals");
        return {
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token }) {
      const userId = await getUserIdByEmail(token.email);
      const current_user = await findUserWithNotifications(userId);
      token.user = current_user;

      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token from a provider.
      session.user = token.user;
      return session;
    },
  },
};
