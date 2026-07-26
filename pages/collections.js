import { useState, useCallback } from "react";
import { getSession, useSession } from "next-auth/react";
import { FaEnvelope } from "react-icons/fa";
import Loader from "../components/common/Loader";
import Table from "../components/Table";
import { collectionColumn } from "../components/Table/columns/collectionColumn";
import { API_URL } from "../config";
import useGetData from "../hooks/useGetData";

function CollectionsPage() {
  const { data } = useSession();
  const id = data?.user?.id;

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
  const route = id ? `/posters/details/${id}?${query}` : null;

  const { data: fetchedData, isLoading } = useGetData(route);

  const posterData = fetchedData?.data?.data || fetchedData?.data || {};
  const details = posterData?.details || [];
  const total = posterData?.total || 0;

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

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaEnvelope />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Collections</h1>
      </div>

      <Loader isLoading={isLoading}>
        <div className="mt-7">
          <div className="p-4 bg-white rounded shadow-md lg:p-8">
            {details && (
              <Table
                columnsHeading={collectionColumn}
                usersData={details}
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
          </div>
        </div>
      </Loader>
    </div>
  );
}

export default CollectionsPage;
