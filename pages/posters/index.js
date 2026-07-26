import { getSession, useSession } from "next-auth/react";
import { useState, useCallback } from "react";
import { FaUsers } from "react-icons/fa";
import Loader from "../../components/common/Loader";
import PosterForm from "../../components/Form/PosterForm";
import DynamicLinkForm from "../../components/Form/DynamicLinkForm";
import TagForm from "../../components/Form/TagForm";
import Table from "../../components/Table";
import { postersColumn } from "../../components/Table/columns/postersColumn";
import Tabs from "../../components/Tabs";
import useGetData from "../../hooks/useGetData";
import { getTimeDistance } from "./../../utils/getTimeDistance";

function Posterspage() {
  const { data: session } = useSession();
  const { id, username, admin, adminId } = session
    ? session.user
    : "";

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
  const route = id ? `/all/poster/${id}?${query}` : null;

  const {
    data: fetchedData,
    isLoading,
    isError,
  } = useGetData(route);

  const postersResponse = fetchedData?.data?.data || fetchedData?.data || {};
  const userData = postersResponse?.posters || [];
  const total = postersResponse?.total || 0;

  const handlePageChange = useCallback((newPageIndex) => {
    setPageIndex(newPageIndex);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPageIndex(0);
  }, []);

  const handleSortChange = useCallback((newSortBy) => {
    setSortBy(newSortBy);
    setPageIndex(0);
  }, []);

  const handleGlobalFilterChange = useCallback((filter) => {
    setGlobalFilter(filter);
    setPageIndex(0);
  }, []);

  const table = userData && (
    <Table
      columnsHeading={postersColumn}
      usersData={userData}
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
  );
  const form = <PosterForm id={id} adminId={adminId} />;

  const tabsData = [
    {
      label: "All Users",
      content: table,
    },
    {
      label: "Add User",
      content: form,
    },
    {
      label: "Create Link",
      content: <DynamicLinkForm id={id} />,
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaUsers />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Users</h1>
      </div>

      <Loader isLoading={isLoading}>
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <Tabs tabsData={tabsData} />
        </div>
      </Loader>
    </div>
  );
}

export default Posterspage;
