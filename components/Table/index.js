import { useState, useMemo, useCallback } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  useRowSelect,
} from "react-table";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
} from "react-icons/fa";
import { GlobalFilter } from "./GlobalFilter";
import useToggle from "../../hooks/useToggle";

function Table({
  columnsHeading,
  usersData,
  // Server-side pagination props
  pageIndex = 0,
  pageSize = 20,
  total = 0,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  onGlobalFilterChange,
  // Server-side feature flags
  manualSorting = true,
  manualGlobalFilter = true,
}) {
  const columns = useMemo(() => columnsHeading, [columnsHeading]);
  const data = useMemo(() => usersData || [], [usersData]);

  const { togggle: active, setToggle: setActive, node } = useToggle();

  const showMenu = (i) => {
    if (active === i) {
      return setActive(null);
    }
    setActive(i);
  };

  // Handle sort change
  const handleSortChange = useCallback(
    (sortBy) => {
      if (manualSorting && onSortChange) {
        onSortChange(sortBy);
      }
    },
    [manualSorting, onSortChange]
  );

  // Handle global filter change
  const handleGlobalFilterChange = useCallback(
    (filter) => {
      if (manualGlobalFilter && onGlobalFilterChange) {
        onGlobalFilterChange(filter);
      }
    },
    [manualGlobalFilter, onGlobalFilterChange]
  );

  const tableInstance = useTable(
    {
      columns,
      data,
      manualSorting,
      manualGlobalFilter,
      initialState: { pageSize },
      defaultColumn: {
        minWidth: 150,
      },
      // Disable auto-reset for server-side pagination
      autoResetPage: false,
      autoResetSortBy: false,
      autoResetGlobalFilter: false,
      autoResetFilters: false,
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    useRowSelect
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    state,
    setGlobalFilter,
    page, // current page data (already paginated from parent)
  } = tableInstance;

  const { globalFilter, sortBy } = state;

  // Calculate pagination values for display
  const pageCount = Math.ceil(total / pageSize);
  const canPreviousPage = pageIndex > 0;
  const canNextPage = pageIndex < pageCount - 1;

  // Handle page size change
  const handlePageSizeChange = useCallback(
    (newPageSize) => {
      if (onPageSizeChange) {
        onPageSizeChange(newPageSize);
      }
    },
    [onPageSizeChange]
  );

  // Handle page change
  const handlePageChange = useCallback(
    (newPageIndex) => {
      if (onPageChange) {
        onPageChange(newPageIndex);
      }
    },
    [onPageChange]
  );

  return (
    <div className="py-10">
      <GlobalFilter
        filter={globalFilter}
        setFilter={handleGlobalFilterChange}
      />
      <div className="flex flex-col items-stretch overflow-x-auto">
        <table
          {...getTableProps()}
          className="table-auto text-xs lg:text-base"
        >
          <thead className="bg-white">
            {headerGroups.map((headerGroup, i) => (
              <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, i) => (
                  <th
                    key={i}
                    {...column.getHeaderProps({
                      style: {
                        minWidth: column.minWidth,
                        width: column.width,
                      },
                    })}
                    className={`px-2 py-3 text-sm border-collapse border border-gray-100 capitalize`}
                  >
                    {column.render("Header")}
                    <span
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="inline-block px-2"
                    >
                      {!column.disableSortBy && !manualSorting && (
                        <div className="text-xs">
                          {column.isSorted ? (
                            column.isSortedDesc ? (
                              <FaSortDown />
                            ) : (
                              <FaSortUp />
                            )
                          ) : (
                            <FaSort />
                          )}
                        </div>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row);
              return (
                <tr
                  key={i}
                  {...row.getRowProps()}
                  className={`odd:bg-gray-50 ${
                    active === i && "shadow bg-slate-100"
                  }`}
                >
                  {row.cells.map((cell, i) => {
                    return (
                      <td
                        key={i}
                        {...cell.getCellProps()}
                        className="px-4 py-3 text-sm text-custom-gray3 font-semibold border-collapse border border-gray-100"
                      >
                        {cell.render("Cell")}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            {page.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500"
                >
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {total > 0 && (
        <div className="mt-5 flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-7 text-sm">
          <div className="">
            <span className="text-sm">
              Page{" "}
              <strong>
                {pageIndex + 1} of {pageCount || 1}
              </strong>
            </span>
          </div>

          <div className="space-x-5">
            <span>
              Rows per page:{" "}
              <select
                className="outline-none w-12 border border-slate-300"
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              >
                {[20, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </span>

            <span>
              Go to page:{" "}
              <input
                type="number"
                min="1"
                max={pageCount || 1}
                className="w-10 outline-none border border-slate-500"
                defaultValue={pageIndex + 1}
                onChange={(e) => {
                  const pageNumber = e.target.value
                    ? Number(e.target.value) - 1
                    : 0;
                  handlePageChange(Math.max(0, Math.min(pageNumber, pageCount - 1)));
                }}
              />
            </span>
          </div>

          <div className="flex gap-1">
            <button
              className="p-1 text-sm rounded-sm bg-cyan-300 disabled:opacity-50"
              onClick={() => handlePageChange(0)}
              disabled={!canPreviousPage}
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              className="bg-cyan-300 active:bg-cyan-400 px-3 py-1 rounded-sm text-sm disabled:opacity-50"
              onClick={() => handlePageChange(pageIndex - 1)}
              disabled={!canPreviousPage}
            >
              Previous
            </button>
            <button
              className="bg-cyan-300 active:bg-cyan-400 px-3 py-1 rounded-sm text-sm disabled:opacity-50"
              onClick={() => handlePageChange(pageIndex + 1)}
              disabled={!canNextPage}
            >
              Next
            </button>
            <button
              className="p-1 text-sm rounded-sm  bg-cyan-300 disabled:opacity-50"
              onClick={() => handlePageChange(pageCount - 1)}
              disabled={!canNextPage}
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
