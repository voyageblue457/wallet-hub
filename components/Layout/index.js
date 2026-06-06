// import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { Router, useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { dashboardLinks } from "./Sidebar/navlinks/dashboardLinks";
import useToggle from "../../hooks/useToggle";
import Pusher from "pusher-js";
import useLogOut from "../../hooks/useLogOut";
import { useEffect } from "react";
import useGetData from "../../hooks/useGetData";

function Layout({ children, heading }) {
  // const [showMenu, setShowMenu] = useState(false);
  const { toggle: showMenu, setToggle: setShowMenu, node } = useToggle();

  Router.events.on("routeChangeStart", (url) => {
    setShowMenu(false);
  });

  const { pathname } = useRouter();

  const { logoutUser } = useLogOut();

  const { data } = useSession();

  console.log("usersession", data);

  const admin = data?.user?.admin;
  const username = data?.user?.username;

  const adminId = data?.user.adminId;

  const id = admin ? data?.user?.adminId : (data?.user?.posterId || data?.user?.id);
  const { data: amountSummary } = useGetData(
    id ? `/amount/summary/${id}` : null
  );

  useEffect(() => {
    if (adminId) {
      const pusher = new Pusher(
        "f47713a33f95b281fff6", // APP_KEY
        {
          cluster: "ap2",
          encrypted: true,
        }
      );

      const channel = pusher.subscribe(adminId);
      channel.bind("password-notification", (data) => {
        console.log("event from backend:", data);
        data.adminId === adminId && logoutUser();
      });

      return () => {
        // channel.unbind_all();
        // channel.unbind(); // Unbind event listeners when component unmounts
        // pusher.unsubscribe("notifications");
        channel.unbind("password-notification"); // Unbind event listeners when component unmounts
        pusher.unsubscribe(adminId);
      };
    }
  }, [adminId]);

  // console.log("usersession", data);

  // const username = data?.user?.username;

  const filteredLinks = () => {
    let links = dashboardLinks;

    // if (qrCodeStatus === false) {
    //   links = dashboardLinks.filter((item) => item.name !== "QR Code");
    // }

    if (admin === true) {
      return links.filter((item) => item.name !== "Collections");
    }
    if (admin === false) {
      return links.filter((item) => item.name !== "Users");
    }
    return links;
  };

  if (pathname.includes("/sign-")) {
    return <>{children}</>;
  }

  // if (!data) {
  //   return <>{children}</>;
  // }

  if (pathname.includes("password")) {
    return <>{children}</>;
  }

  return (
    <>
      <div className="lg:flex">
        <Sidebar
          showMenu={showMenu}
          setShowMenu={setShowMenu}
          node={node}
          navLinks={filteredLinks()}
          admin={admin}
          totalAmount={amountSummary?.data?.total}
        />

        <div className="lg:flex-1">
          <Header
            admin={admin}
            username={username}
            showMenu={showMenu}
            setShowMenu={setShowMenu}
          />

          <div className="py-5 px-2 lg:px-5">
            {/* <PageHeading /> */}

            {children}
          </div>
        </div>
      </div>
    </>
  );
}

export default Layout;
