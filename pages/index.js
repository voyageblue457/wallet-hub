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
import { useState, useCallback } from "react";

function HomePage() {
  const { data } = useSession();
  const admin = data?.user?.admin;
  const adminId = data?.user?.adminId;
  const posterId = data?.user?.posterId || data?.user?.id;

  const route = admin ? `/${adminId}` : `/${adminId}/${posterId}`;

  // Server-side pagination state
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");

  // Build query string for API
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams({
      page: pageIndex + 1,
      pageSize,
    });
    if (sortBy.length > 0) {
      params.append("sortBy", JSON.stringify(sortBy));
    }
    if (globalFilter) {
      params.append("filter", globalFilter);
    }
    return params.toString();
  }, [pageIndex, pageSize, sortBy, globalFilter]);

  const query = buildQuery();
  const apiRoute = adminId ? `${route}/clicks?${query}` : null;

  const { data: fetchedData, isLoading } = useGetData(apiRoute);
  const { data: fetchedData2, isLoading: isLoading2 } = useGetData(
    (admin ? adminId : posterId)
      ? `/today/app/details/data/poster/hello/found/end/${admin ? adminId : posterId}`
      : null
  );

  const clicksData = fetchedData?.data?.data || [];
  const total = fetchedData?.data?.total || 0;

  const cardsData = fetchedData2?.data;

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

  const handlePageChange = useCallback((newPageIndex) => {
    setPageIndex(newPageIndex);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPageIndex(0); // Reset to first page when page size changes
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    setPageIndex(0); // Reset to first page when sort changes
  }, []);

  const handleGlobalFilterChange = useCallback((filter) => {
    setGlobalFilter(filter);
    setPageIndex(0); // Reset to first page when filter changes
  }, []);

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
            <Table
              columnsHeading={clicksColumn}
              usersData={clicksData}
              pageIndex={pageIndex}
              pageSize={pageSize}
              total={total}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              onSortChange={handleSortChange}
              onGlobalFilterChange={handleGlobalFilterChange}
              manualSorting={true}
              manualGlobalFilter={true}
            />
          )}
          {!clicksData && !isLoading && <p className="mt-10 text-lg">No Clicks</p>}
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
