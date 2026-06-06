// import Cards from "../components/Cards";
// import { FaHome } from "react-icons/fa";
// import { useSession } from "next-auth/react";
// import Marquee from "react-fast-marquee";
// // import { useEffect, useState } from "react";
// import useGetData from "../hooks/useGetData";

// export default function Home() {
//   // const [showAd, setShowAd] = useState(false);

//   const { data: session } = useSession();
//   const { adminId } = session ? session.user : "";
//   // const qrCodeStatus = data?.user?.qrCodeStatus;

//   const { data: fetchedData, isLoading } = useGetData(
//     `/qrcode/status/check/${adminId}`
//   );

//   console.log("ad", fetchedData);

//   // useEffect(() => {
//   //   // qrCodeStatus === true && setShowAd(true);
//   //   fetchedData.status !== true && setShowAd(true);
//   // }, []);

//   return (
//     <div className="">
//       <div className="flex items-center gap-3">
//         <span className="text-[28px] text-custom-blue2">
//           <FaHome />
//         </span>
//         <h1 className="text-2xl font-bold text-custom-gray2">Dashboard</h1>
//       </div>
//       <a href="https://www.back4page.com" target="_blank" rel="noreferrer">
//         <div className="mt-7 bg-cyan-700 px-5 py-3 text-white font-semibold">
//           <Marquee gradient={false} speed={150}>
//             <span className="mr-20 md:mr-0">
//               Need more traffic? visit back4page.com
//             </span>
//           </Marquee>
//         </div>
//       </a>

//       {session && fetchedData?.data?.status !== true && !isLoading && (
//         <div className="mt-2 bg-red-700 px-5 py-3 text-white font-semibold">
//           <Marquee gradient={false} speed={130}>
//             <span className="mr-20 md:mr-0">
//               A new feature QR Code Generator is added. Please contact with
//               admin to activate.
//             </span>
//           </Marquee>
//         </div>
//       )}

//       <div className="grid lg:grid-cols-3 gap-8 mt-7 md:grid-cols-2 ">
//         <Cards />
//       </div>
//     </div>
//   );
// }

import { useSession } from "next-auth/react";
import {
  FaCalculator,
  FaHome,
  FaHourglassEnd,
  FaUserAlt,
} from "react-icons/fa";
import Loader from "../components/common/Loader";
import Table from "../components/Table";
import { clicksColumn } from "../components/Table/columns/clicksColumn";
import useGetData from "../hooks/useGetData";
import { FaMobileAlt, FaDesktop, FaTabletAlt, FaUsers } from "react-icons/fa";
function HomePage() {
  const { data } = useSession();
  const admin = data?.user?.admin;
  const adminId = data?.user?.adminId;
  const posterId = data?.user?.posterId || data?.user?.id;

  const route = admin ? `/${adminId}` : `/${adminId}/${posterId}`;

  const { data: fetchedData, isLoading, isError } = useGetData(route);

  const {
    data: fetchedData2,
    isLoading: isLoading2,
    isError: isError2,
  } = useGetData(
    `/today/app/details/data/poster/hello/found/end/${
      admin ? adminId : posterId
    }`
  );

  // console.log("fetchedata2", fetchedData2?.data);

  const clicksData = fetchedData?.data?.click;

  const cardsData = fetchedData2?.data;

  console.log("clicksData", clicksData);

  const cards = [
    {
      title: "MOBILE CLICK",
      count: cardsData?.mobileClick,
      description: "Today history only",
      color: "bg-red-500",
      icon: <FaMobileAlt className="text-white text-2xl" />,
    },
    {
      title: "DESKTOP CLICK",
      count: cardsData?.desktopClick,
      description: "Today history only",
      color: "bg-orange-500",
      icon: <FaDesktop className="text-white text-2xl" />,
    },
    {
      title: "TABLET CLICK",
      count: cardsData?.tabletClick,
      description: "Today history only",
      color: "bg-green-500",
      icon: <FaTabletAlt className="text-white text-2xl" />,
    },
    {
      title: "TOTAL CLICK",
      count: cardsData?.totalClick,
      description: "This year history",
      color: "bg-blue-500",
      icon: <FaUsers className="text-white text-2xl" />,
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaHome />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Dashboard</h1>
      </div>

      <Loader isLoading={isLoading || isLoading2}>
        <div className="flex flex-wrap justify-center lg:justify-start gap-4 p-4">
          {cards.map((stat, index) => (
            <div key={index} className="w-full sm:w-1/2 lg:w-1/5 p-2">
              <div className="p-4 rounded-lg shadow-lg bg-white flex justify-between flex-row items-center">
                <div className="">
                  <h2 className="mt-2 text-lg font-semibold">{stat.title}</h2>
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-sm text-gray-500">{stat.description}</p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center`}
                >
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-white p-4 lg:p-8  rounded shadow-md">
          <h4 className="text-xl font-semibold">Total Clicks</h4>
          {clicksData && (
            <Table columnsHeading={clicksColumn} usersData={clicksData} />
          )}
          {!clicksData && <p className="mt-10 text-lg">No Clicks</p>}
        </div>
      </Loader>
    </div>
  );
}

export async function getServerSideProps(context) {
  return {
    redirect: {
      destination: "/amount",
      permanent: false,
    },
  };
}

export default HomePage;
