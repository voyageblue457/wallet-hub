import Link from "next/link";
import DeletePoster from "../../DeletePoster";
import { getTimeDistance } from "../../../utils/getTimeDistance";

export const postersColumn = [
  {
    Header: "Username",
    accessor: "username",
    Cell: ({ row, value }) => (
      <Link href={`/posters/details/${row.original._id}`}>
        <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold">
          {value}
        </span>
      </Link>
    ),
  },
  {
    Header: "Password",
    accessor: "password",
  },

  {
    Header: "Total Links",
    accessor: "links.length",
    // Cell: ({ value }) => (
    //   <div>
    //     <button className="px-2 py-1 rounded bg-red-700 text-white text-sm">
    //       {value}
    //     </button>
    //   </div>
    // ),
  },
  {
    Header: "Time",
    accessor: "createdAt",
    disableSortBy: true,
    width: "auto",
    Cell: ({ row }) => (
      <div className="flex justify-center items-center">
        {row.original.createdAt && getTimeDistance(row.original.createdAt)}
      </div>
    ),
  },
  {
    Header: "Options",
    accessor: "_id",
    disableSortBy: true,
    width: 200,
    Cell: ({ row }) => (
      <div className="flex justify-center items-center gap-2">
        <div className="">
          <Link href={`/posters/details/${row.original._id}`}>
            <button className="bg-cyan-600 text-xs text-white font-semibold px-2 py-1 rounded">
              Details
            </button>
          </Link>
        </div>

        <div className="">
          <Link href={`/posters/edit/${row.original._id}`}>
            <button className="bg-slate-600 text-xs text-white font-semibold px-2 py-1 rounded">
              Edit
            </button>
          </Link>
        </div>

        <DeletePoster posterInfo={row.original} />
        <Link href={`/posters/add/${row.original._id}`}>
            <button className="bg-green-600 text-xs text-white font-semibold px-2 py-1 rounded">
              Add
            </button>
          </Link>
      </div>
    ),
  },
];
