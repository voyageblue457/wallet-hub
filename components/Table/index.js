import { useState, useMemo } from "react";
import {
  useTable,
  useSortBy,
  useGlobalFilter,
  useFilters,
  usePagination,
  useRowSelect,
} from "react-table";
import {
  FaSort,
  FaSortUp,
  FaSortDown,
  FaAngleDoubleLeft,
  FaAngleDoubleRight,
  FaTrash,
  FaEdit,
  FaTimes,
} from "react-icons/fa";
import { BsThreeDots } from "react-icons/bs";
import { MdOutlineClose } from "react-icons/md";
// import { COLUMNS } from "./columns";
// import MOCK_DATA from "./data.json";
import { GlobalFilter } from "./GlobalFilter";
import useToggle from "../../hooks/useToggle";
// import TableMenu from "./TableMenu";
// import { ColumnFilter } from "./ColumnFilter";
// import { Checkbox } from "./Checkbox";

function Table({ columnsHeading, usersData }) {
  const columns = useMemo(() => columnsHeading, [columnsHeading]);
  // const data = useMemo(() => MOCK_DATA, []);
  const data = useMemo(() => usersData, [usersData]);
  // const defaultColumn = useMemo(() => {
  //   return {
  //     Filter: ColumnFilter,
  //   };
  // }, []);

  // console.log("tables", usersData);

  // const [active, setActive] = useState("");
  const { togggle: active, setToggle: setActive, node } = useToggle();
  // const { node } = useToggle();

  const showMenu = (i) => {
    if (active === i) {
      return setActive(null);
    }

    setActive(i);
  };

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state,
    setGlobalFilter,
    nextPage,
    previousPage,
    canPreviousPage,
    canNextPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    // selectedFlatRows,
  } = useTable(
    {
      columns,
      data,
      initialState: { pageSize: 20 },
      defaultColumn: {
        minWidth: 150,
      },
    },
    useGlobalFilter,
    useFilters,
    useSortBy,
    usePagination,
    useRowSelect
    // (hooks) => {
    //   hooks.visibleColumns.push((columns) => [
    //     {
    //       id: "selection",
    //       // Header: ({ getToggleAllRowsSelectedProps }) => (
    //       //   <Checkbox {...getToggleAllRowsSelectedProps()} />
    //       // ),
    //       // Cell: ({ row }) => <Checkbox {...row.getToggleRowSelectedProps()} />,
    //     },
    //     ...columns,
    //   ]);
    // }
  );

  const { globalFilter, pageIndex, pageSize } = state;

  // const selectedRows = JSON.stringify(
  //   {
  //     selectedFlatRows: selectedFlatRows.map((row) => row.original),
  //   },
  //   null,
  //   2
  // );

  // console.log(selectedRows);

  // const [pageNumber, setPageNumber] = useState(pageIndex + 1);

  // console.log(pageIndex + 1);

  return (
    // <div className="flex flex-col items-stretch  px-7 py-10">
    <div className="py-10">
      <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
      <div className="flex flex-col items-stretch overflow-x-auto">
        <table {...getTableProps()} className="table-auto text-xs lg:text-base">
          <thead className="bg-white">
            {headerGroups.map((headerGroup, i) => (
              <tr key={i} {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column, i) => (
                  <th
                    key={i}
                    {...column.getHeaderProps({
                      style: { minWidth: column.minWidth, width: column.width },
                    })}
                    // style={{ width: column.width }}
                    className={`px-2 py-3 text-sm border-collapse border border-gray-100 capitalize`}
                  >
                    {/* <span
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                  > */}
                    {column.render("Header")}
                    {/* </span> */}
                    <span
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                      className="inline-block px-2"
                    >
                      {!column.disableSortBy && (
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
                    {/* <div className="mt-2 text-black font-normal">
                      {column.canFilter ? column.render("Filter") : null}
                    </div> */}
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
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex flex-col lg:flex-row justify-center items-center gap-4 lg:gap-7 text-sm">
        <div className="">
          <span className="text-sm">
            Page{" "}
            <strong>
              {pageIndex + 1} of {pageOptions.length}
            </strong>
          </span>
        </div>

        <div className="space-x-5">
          <span>
            Rows per page:{" "}
            <select
              className="outline-none w-12 border border-slate-300"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
            >
              {[20, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </span>

          <span>
            Go to page:{" "}
            <input
              type="number"
              min="1"
              max={pageOptions.length}
              className="w-10 outline-none border border-slate-500"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const pageNumber = e.target.value
                  ? Number(e.target.value) - 1
                  : 0;
                gotoPage(pageNumber);
              }}
            />
          </span>
        </div>

        <div className="flex gap-1">
          <button
            className="p-1 text-sm rounded-sm bg-cyan-300 disabled:opacity-50"
            onClick={() => gotoPage(0)}
            disabled={!canPreviousPage}
          >
            <FaAngleDoubleLeft />
          </button>
          <button
            className="bg-cyan-300 active:bg-cyan-400 px-3 py-1 rounded-sm text-sm disabled:opacity-50"
            onClick={() => previousPage()}
            disabled={!canPreviousPage}
          >
            Previous
          </button>
          <button
            className="bg-cyan-300 active:bg-cyan-400 px-3 py-1 rounded-sm text-sm disabled:opacity-50"
            onClick={() => nextPage()}
            disabled={!canNextPage}
          >
            Next
          </button>
          <button
            className="p-1 text-sm rounded-sm  bg-cyan-300 disabled:opacity-50"
            onClick={() => gotoPage(pageCount - 1)}
            disabled={!canNextPage}
          >
            <FaAngleDoubleRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Table;
