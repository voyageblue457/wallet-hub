import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { API_URL } from "../../../config";
import cookie from "cookie";

const nextAuthOptions = (req, res) => {
  return {
    session: {
      strategy: "jwt",
    },
    providers: [
      CredentialsProvider({
        name: "Credentials",
        // credentials: {},
        authorize: async (credentials) => {
          // const payload = {
          //   email: credentials.email,
          //   password: credentials.password,
          // };
          const { ...values } = credentials;

          const url = `${API_URL}/login`;

          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          const user = await response.json();

          console.log("auth", user);

          // console.log("main", url);

          // if (response.ok && user) {
          if (response.ok && user.id) {
            // res.setHeader("Set-Cookie", [
            //   // cookie.serialize("token", user.token, {
            //   //   httpOnly: true,
            //   //   secure: process.env.NODE_ENV !== "development",
            //   //   maxAge: 30 * 24 * 60 * 60, // 30 days
            //   //   sameSite: "strict",
            //   //   path: "/",
            //   // }),
            //   cookie.serialize("id", user.id, {
            //     // httpOnly: true,
            //     // secure: process.env.NODE_ENV !== "development",
            //     maxAge: 30 * 24 * 60 * 60, // 30 days
            //     sameSite: "strict",
            //     path: "/",
            //   }),
            //   cookie.serialize("adminId", user.adminId, {
            //     // httpOnly: true,
            //     // secure: process.env.NODE_ENV !== "development",
            //     maxAge: 30 * 24 * 60 * 60, // 30 days
            //     sameSite: "strict",
            //     path: "/",
            //   }),
            //   cookie.serialize("username", user.username, {
            //     // httpOnly: true,
            //     // secure: process.env.NODE_ENV !== "development",
            //     maxAge: 30 * 24 * 60 * 60, // 30 days
            //     sameSite: "strict",
            //     path: "/",
            //   }),
            //   cookie.serialize("admin", user.admin, {
            //     // httpOnly: true,
            //     // secure: process.env.NODE_ENV !== "development",
            //     maxAge: 30 * 24 * 60 * 60, // 30 days
            //     sameSite: "strict",
            //     path: "/",
            //   }),
            // ]);
            return user;
          } else {
            // console.log("error", user);
            // throw new Error(user.error);
            throw new Error("Something went wrong");
          }
        },
      }),
    ],

    pages: {
      signIn: "/sign-in",
    },

    callbacks: {
      jwt: async ({ token, user, account }) => {
        // console.log("xxs", token, user, account);
        if (user) {
          token.user = user;

          token.accessToken = user.access_token;

          // token.token = user.token;
          // token.id = user.id;
          // token.role = user.role;
          // token.user_name = user.user_name;
          // token.institution_name = user.institution_name;
        }
        if (account) {
          token.accessToken = account.access_token;
        }

        // console.log("account is", account);

        return token;
      },
      session: async ({ session, token }) => {
        if (token) {
          session.user = token.user;
          // session.token = token.user.token;
          // session.id = token.user.id;
          // session.identity_id = token.user.identity_id;
        }

        // console.log("session IS", session);

        return session;
      },
    },

    secret: process.env.NEXTAUTH_SECRET,
  };
};

export default (req, res) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};
