import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { FaAngleLeft } from "react-icons/fa";

function Sidebar({ showMenu, setShowMenu, node, name, navLinks, admin, totalAmount }) {
  // const [role, setRole] = useState("root");
  const router = useRouter();

  // console.log("usersession", data);

  // const username = data?.user?.username;

  // const [active, setActive] = useState("");

  const activeClass = (path) => {
    // router.pathname === path
    if (router.pathname === path) {
      return "bg-gray-600 text-white rounded-md";
    }
    // if (router.pathname.includes(path)) {
    //   return "bg-custom-blue5 text-white";
    // }

    return "text-gray-400 hover:text-white hover:bg-gray-700 rounded-md";
  };

  useEffect(() => {
    if (showMenu) {
      document.body.classList.add("overflow-y-hidden");
    }

    return () => document.body.classList.remove("overflow-y-hidden");
  }, [showMenu]);

  return (
    <div
      className={`
        ${
          showMenu
            ? "fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:bg-transparent"
            : ""
        }
      `}
    >
      <div
        ref={node}
        className={`h-screen overflow-y-auto bg-[#212E34] z-30 top-0 bottom-0 fixed lg:sticky sidebar text-white lg:translate-x-0 w-[264px] ease-out duration-300 ${
          showMenu ? "translate-x-0" : "-translate-x-full"
        }
      `}
      >
        <div className="  items-center gap-10">
          <div className="text-white py-[16px] font-semibold flex justify-between items-center">
            <h1 className=" pl-6 text-xl lg:text-2xl">Cash Tool</h1>
            <span
              className="p-1 mr-5 rounded-full border-2 border-custom-blue2 text-custom-blue2 lg:hidden"
              onClick={() => setShowMenu(!showMenu)}
            >
              <FaAngleLeft size={20} />
            </span>
          </div>

          {totalAmount !== undefined && (
            <div className="mx-4 my-2 p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 shadow-lg border border-emerald-400/20 transform hover:scale-[1.02] transition-transform duration-300">
              <p className="text-xs uppercase tracking-wider text-emerald-100/80 font-medium ">
                {admin ? "Total Collections" : "My Collections"}
              </p>
              <h2 className="text-2xl font-bold mt-1 text-white tracking-tight">
                ${parseFloat(totalAmount || 0).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </h2>
            </div>
          )}

          <div className="mt-3 mx-3 space-y-5">
            {navLinks?.map((navLink, i) => (
              <div key={i} className="">
                <Link href={navLink.link} passHref>
                  <div
                    key={i}
                    className={`px-3 py-3 flex justify-between items-center font-semibold transition duration-300 rounded-sm ${activeClass(
                      navLink.link
                    )}`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[15px]">{navLink.icon}</span>

                      <p className="text-[13px]">{navLink.name}</p>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
