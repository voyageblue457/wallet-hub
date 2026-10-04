import { useState } from "react";
import { toast } from "react-toastify";
import { getTimeDistance } from "../../../utils/getTimeDistance";
import { API_URL } from "../../../config";

function CheckPaymentCell({ row, handleCheckStatus, isChecking }) {
  const [internalChecking, setInternalChecking] = useState(false);
  const [isLocallyPaid, setIsLocallyPaid] = useState(false);

  const hasInvoice = !!row.original.rHash || !!row.original.lightningInvoice;
  const statusVal = row.original.status;
  const isSuccess = isLocallyPaid || statusVal === true || statusVal === "true";
  const checking = isChecking ?? internalChecking;

  if (!hasInvoice) {
    return <span className="text-gray-400 text-xs italic">No LND invoice</span>;
  }

  if (isSuccess) {
    return <span className="text-green-600 font-bold text-xs uppercase tracking-wider">Paid / Verified</span>;
  }

  const handleClick = async () => {
    if (handleCheckStatus) {
      handleCheckStatus(row.original._id);
    } else {
      setInternalChecking(true);
      try {
        const res = await fetch(`${API_URL}/payment/check/${row.original._id}`);
        const data = await res.json();
        if (data && data.success) {
          toast.success("Payment verified & marked as Paid!");
          setIsLocallyPaid(true);
        } else {
          toast.info(data?.error || "Payment is still pending.");
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        toast.error("Failed to verify payment status. Try again.");
      } finally {
        setInternalChecking(false);
      }
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={checking}
      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1 active:scale-95 cursor-pointer"
    >
      {checking && (
        <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
      )}
      <span>Verify</span>
    </button>
  );
}

export const getCollectionColumn = (handleCheckStatus, checkingIds) => [
  {
    Header: "website",
    accessor: "site",
    width: "auto",
    Cell: ({ value }) => (
      <span className="break-all font-mono text-xs font-medium text-custom-blue5 select-all">
        {value || "-"}
      </span>
    ),
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
    },
  },
  {
    Header: "Check Payment",
    accessor: "_id",
    width: "auto",
    Cell: ({ row }) => (
      <CheckPaymentCell
        row={row}
        handleCheckStatus={handleCheckStatus}
        isChecking={checkingIds && checkingIds[row.original._id]}
      />
    ),
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

export const collectionColumn = getCollectionColumn();
