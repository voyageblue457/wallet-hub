import { useState, useCallback } from "react";
import Loader from "../common/Loader";
import Table from "../Table";
import { linkColumn } from "../Table/columns/linkColumn";
import useGetData from "../../hooks/useGetData";

function AdminLinks({ id, admin }) {
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
  const route = id ? `/link/get/all/hello/world/com/data/${id}/${admin}?${query}` : null;

  const { data: fetchedData, isLoading } = useGetData(route);

  const rawLinks = fetchedData?.data?.data || [];
  const linksData = rawLinks.map((item) => typeof item === "string" ? { site: item } : item);
  const total = fetchedData?.data?.total || 0;

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
      <Loader isLoading={isLoading}>
        <div className="mt-7 bg-white p-4 lg:p-8  rounded shadow-md">
          <h4 className="text-xl font-semibold">All Links</h4>
          {linksData && (
            <Table
              columnsHeading={linkColumn}
              usersData={linksData}
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
          {!linksData && !isLoading && <p className="mt-10 text-lg">No Links</p>}
        </div>
      </Loader>
    </div>
  );
}

export default AdminLinks;
