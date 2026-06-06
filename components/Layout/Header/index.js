import { FaAngleDown, FaAngleUp, FaBars, FaUserCircle } from "react-icons/fa";
import useLogOut from "../../../hooks/useLogOut";
import useToggle from "../../../hooks/useToggle";
import Notification from "./Notification";

function Header({ admin, username, showMenu, setShowMenu }) {
  const { toggle, setToggle, node } = useToggle();

  const { logoutUser } = useLogOut();

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <div className="sticky top-0 z-20">
      <div className="relative z-20">
        <div className="bg-[#3A8CBC] h-[68px] w-full flex justify-between lg:justify-end items-center shadow-md  px-7 z-30">
          <div
            className="text-white lg:hidden"
            onClick={() => setShowMenu(!showMenu)}
          >
            <FaBars size={20} />
          </div>

          <div className="text-xl text-white font-bold lg:hidden">
            Links Tracker
          </div>

          <div className="flex justify-between items-center gap-5 lg:gap-[80px]">
            <div className="hidden lg:flex justify-between items-center gap-12 text-white text-base font-semibold">
              <p className="">Username: {username}</p>
              <p className="">Role : {admin ? "Admin" : "Poster"}</p>
            </div>

            <Notification />

            <button
              className="hidden lg:block bg-custom-blue5 hover:bg-opacity-80 active:scale-95 text-sm text-white font-semibold px-2 py-1 lg:px-4 lg:py-2 rounded-md transition duration-200"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>

          <div
            className="lg:hidden text-white p-1 rounded-full border-2 border-custom-blue2"
            onClick={() => setToggle(!toggle)}
          >
            {toggle ? <FaAngleUp size={20} /> : <FaAngleDown size={20} />}
          </div>
        </div>
      </div>
      <div
        ref={node}
        className={`lg:hidden flex flex-col items-center bg-custom-blue5 absolute top-[68px] w-full py-7 text-sm text-white font-semibold shadow-md ease-out duration-300 z-10
            ${toggle ? "translate-y-0" : "-translate-y-full shadow-none"}`}
      >
        <p className="py-3">Username: {username}</p>
        <p className="py-3">Role : {admin ? "Admin" : "Poster"}</p>
        <button
          type="button"
          className="mt-2 px-5  py-3 bg-custom-blue hover:bg-opacity-80 text-sm rounded-lg active:scale-95 transition duration-200"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Header;
