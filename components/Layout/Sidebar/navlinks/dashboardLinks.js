import {
  FaHome,
  FaEnvelope,
  FaUsers,
  FaGlobe,
  FaDollarSign,
} from "react-icons/fa";

export const dashboardLinks = [
  // {
  //   name: "Dashboard",
  //   link: "/",
  //   icon: <FaHome />,
  // },
  {
    name: "Collections",
    link: "/collections",
    icon: <FaEnvelope />,
  },
  {
    name: "Transaction ",
    link: "/amount",
    icon: <FaDollarSign />,
  },
  {
    name: "Users",
    link: "/posters",
    icon: <FaUsers />,
  },
  {
    name: "Links",
    link: "/links",
    icon: <FaGlobe />,
  },
  {
    name: "Withdraw",
    link: "/withdraw",
    icon: <FaGlobe />,
  },
];
