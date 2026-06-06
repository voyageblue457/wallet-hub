import { useState } from "react";
import { useSession } from "next-auth/react";
import { FaDollarSign } from "react-icons/fa";
import Loader from "../components/common/Loader";
import Table from "../components/Table";
import useGetData from "../hooks/useGetData";
import { getTimeDistance } from "../utils/getTimeDistance";
import Link from "next/link";
import { toast } from "react-toastify";
import { API_URL } from "../config";

const getAmountColumn = (admin, posterUsername, handleCheckStatus, checkingIds) => {
  const columns = [
    {
      Header: "Website",
      accessor: "site",
      width: "auto",
    },
    admin && {
      Header: "Username",
      accessor: (row) => row.root?.username || (admin ? "Admin" : (posterUsername || "Admin")),
      id: "username",
      width: "auto",
      Cell: ({ row, value }) => {
        const posterIdVal = row.original.root?._id || row.original.poster || row.original.posterId;
        if (admin && posterIdVal) {
          return (
            <Link href={`/posters/details/${posterIdVal}`}>
              <span className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-semibold">
                {value}
              </span>
            </Link>
          );
        }
        return <span>{value}</span>;
      }
    },
    {
      Header: "Amount",
      accessor: "amount",
      width: "auto",
      Cell: ({ value }) => {
        const parsed = parseFloat(value);
        return (
          <span className="font-bold text-emerald-600">
            {value ? (!isNaN(parsed) ? `$${parsed.toFixed(2)}` : value) : "-"}
          </span>
        );
      },
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
    {
      Header: "Check Payment",
      accessor: "_id",
      width: "auto",
      Cell: ({ row }) => {
        const hasInvoice = !!row.original.rHash;
        const isChecking = checkingIds && checkingIds[row.original._id];
        const statusVal = row.original.status;
        const isSuccess = statusVal === true || statusVal === "true";

        if (!hasInvoice) {
          return <span className="text-gray-400 text-xs italic">No LND invoice</span>;
        }

        if (isSuccess) {
          return <span className="text-green-600 font-bold text-xs uppercase tracking-wider">Paid / Verified</span>;
        }

        return (
          <button
            onClick={() => handleCheckStatus && handleCheckStatus(row.original._id)}
            disabled={isChecking}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1 active:scale-95 cursor-pointer"
          >
            {isChecking && (
              <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            )}
            <span>Verify</span>
          </button>
        );
      }
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
  ];
  return columns.filter(Boolean);
};

function AmountPage() {
  const { data: session } = useSession();
  const admin = session?.user?.admin;
  const id = admin ? session?.user?.adminId : (session?.user?.posterId || session?.user?.id);

  console.log(id, 'posterId')

  const [checkingIds, setCheckingIds] = useState({});

  const { data: fetchedData, isLoading, refetch } = useGetData(
    id ? `/amount/list/${id}` : null
  );

  const handleCheckStatus = async (infoId) => {
    setCheckingIds((prev) => ({ ...prev, [infoId]: true }));
    try {
      const res = await fetch(`${API_URL}/payment/check/${infoId}`);
      const data = await res.json();
      if (data && data.success) {
        toast.success("Payment verified & marked as Paid!");
        refetch();
      } else {
        toast.info(data.error || "Payment is still pending.");
      }
    } catch (error) {
      console.error("Error verifying payment:", error);
      toast.error("Failed to verify payment status. Try again.");
    } finally {
      setCheckingIds((prev) => ({ ...prev, [infoId]: false }));
    }
  };

  const details = fetchedData?.data?.data;
  // console.log('details', details)

  const columns = getAmountColumn(admin, session?.user?.username, handleCheckStatus, checkingIds);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaDollarSign />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">
          Transaction History
        </h1>
      </div>

      <Loader isLoading={isLoading}>
        <div className="mt-7">
          <div className="p-4 bg-white rounded shadow-md lg:p-8">
            {details && details.length > 0 ? (
              <Table columnsHeading={columns} usersData={details} />
            ) : (
              <p className="text-gray-500 py-4 text-center">No Transaction logs found</p>
            )}
          </div>
        </div>
      </Loader>
    </div>
  );
}

export default AmountPage;
