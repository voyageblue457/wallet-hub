// export { default } from "next-auth/middleware";

// export const config = {
//   matcher: ["/", "/information", "/users", "/id-card", "/link"],
// };

import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

export default async function middleware(req) {
  // const { url, nextauth } = req;
  const { origin, pathname } = req.nextUrl;

  const jwt = await getToken({ req, secret });
  const user = jwt?.user?.username;
  console.log("jwt", jwt?.user);
  const role = jwt?.user?.admin;
  const qrCodeStatus = jwt?.user?.qrCodeStatus;
  // const role = false;

  // console.log("middleware token", role);

  if (!user) {
    return NextResponse.redirect(`${origin}/sign-in`);
  }

  // if (user && pathname.includes("/qr-code")) {
  //   if (qrCodeStatus === false) {
  //     return NextResponse.redirect(`${origin}/404`);
  //   }
  //   return NextResponse.next();
  // }

  if (user && pathname.includes("/posters")) {
    if (!role) {
      return NextResponse.redirect(`${origin}/404`);
    }
    return NextResponse.next();
  }

  if (user && pathname === "/collections") {
    if (role) {
      return NextResponse.redirect(`${origin}/404`);
    }
    return NextResponse.next();
  }

  // if (user && pathname === "/open-cash") {
  //   if (role) {
  //     return NextResponse.redirect(`${origin}/404`);
  //   }
  //   return NextResponse.next();
  // }

  return NextResponse.next();

  // const redirectPage = () => NextResponse.redirect(`${origin}/user-signin`);

  // if (!token) {
  //   // if (pathname.startsWith("/post-ad")) {
  //   //   return NextResponse.rewrite(new URL(`${origin}/user-signin`, req.url));
  //   // }

  //   if (pathname.startsWith("/post-ad")) {
  //     return redirectPage();
  //   }
  // }
}

export const config = {
  matcher: [
    "/",
    "/information",
    "/users",
    "/id-card",
    "/link",
    "/links",
    "/amount",
    "/withdraw",
    // "/clicks",
    "/collections",
    "/cash-app",
    "/qr-code",
    "/posters/:path*",
  ],
};
