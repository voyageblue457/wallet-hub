import { useRouter } from "next/router";
import Cookies from "js-cookie";
// import cookie from "cookie";
import { signOut } from "next-auth/react";

function useLogOut() {
  // const dispatch = useDispatch();
  const router = useRouter();

  const logoutUser = () => {
    signOut({
      callbackUrl: `${window.location.origin}/sign-in`,
      // redirect: false,
    });

    // Cookies.remove("id");
    // Cookies.remove("adminId");
    // Cookies.remove("username");
    // Cookies.remove("admin");
    // router.push("/user-signin");
  };

  return { logoutUser };
}

export default useLogOut;
