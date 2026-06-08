import { useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { FaQrcode, FaDollarSign, FaCopy, FaCheck, FaDownload } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import Loader from "../components/common/Loader";
import Table from "../components/Table";
import useGetData from "../hooks/useGetData";
import { getTimeDistance } from "../utils/getTimeDistance";
import Link from "next/link";
import { toast } from "react-toastify";
import { API_URL } from "../config";

const QUICK_AMOUNTS = [10, 50, 100, 200];
const MORE_AMOUNTS = [300, 500, 750, 1000, 1500, 2000];

const getTableColumns = (admin, handleCheckStatus, checkingIds, handleViewQR) => {
  const columns = [
    {
      Header: "Creator",
      accessor: (row) => row.root?.username || "Admin",
      id: "creator",
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
      Header: "Description",
      accessor: "email", // Stored in email field in backend
      width: "auto",
      Cell: ({ value }) => {
        return <span className="text-gray-500 text-xs italic">{value || "No Description"}</span>;
      }
    },
    {
      Header: "Status",
      accessor: "status",
      width: "auto",
      Cell: ({ value }) => {
        const isPaid = value === true || value === "true";
        const bg = isPaid
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-yellow-100 text-yellow-800 border border-yellow-200";
        const label = isPaid ? "paid" : "pending";

        return (
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${bg}`}>
            {label}
          </span>
        );
      }
    },
    {
      Header: "Created At",
      accessor: "createdAt",
      disableSortBy: true,
      width: "auto",
      Cell: ({ row }) => (
        <div className="flex justify-center items-center text-xs text-gray-500">
          {row.original.createdAt && getTimeDistance(row.original.createdAt)}
        </div>
      ),
    },
    {
      Header: "Actions",
      accessor: "_id",
      disableSortBy: true,
      width: "auto",
      Cell: ({ row }) => {
        const isPaid = row.original.status === true || row.original.status === "true";
        const hasInvoice = !!row.original.lightningInvoice;
        const isChecking = checkingIds && checkingIds[row.original._id];

        return (
          <div className="flex items-center gap-2">
            {hasInvoice && (
              <button
                onClick={() => handleViewQR(row.original)}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              >
                <FaQrcode className="text-[10px]" />
                <span>View QR</span>
              </button>
            )}
            {!isPaid && hasInvoice && (
              <button
                onClick={() => handleCheckStatus(row.original._id)}
                disabled={isChecking}
                className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1 cursor-pointer active:scale-95"
              >
                {isChecking && (
                  <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                )}
                <span>Verify</span>
              </button>
            )}
            {isPaid && (
              <span className="text-green-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                <FaCheck className="text-[10px]" />
                <span>Verified</span>
              </span>
            )}
          </div>
        );
      }
    }
  ];
  return columns;
};

export default function CreateQRPage() {
  const { data: session } = useSession();
  const admin = session?.user?.admin;
  const userId = admin ? session?.user?.adminId : (session?.user?.posterId || session?.user?.id);
  const dbUserId = session?.user?.id; // Main DB _id of Admin/User

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [showMore, setShowMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [generatedQR, setGeneratedQR] = useState(null);

  const [checkingIds, setCheckingIds] = useState({});
  const [selectedPosterFilter, setSelectedPosterFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  const [viewingQRRecord, setViewingQRRecord] = useState(null);

  // Fetch list of all transactions/QR codes for the user/poster
  const { data: listRes, isLoading: listLoading, refetch: refetchList } = useGetData(
    userId ? `/amount/list/${userId}` : null
  );

  // Fetch posters for filter dropdown (Admin only)
  const { data: postersRes } = useGetData(
    admin && dbUserId ? `/all/poster/${dbUserId}` : null
  );

  const postersList = postersRes?.data?.data?.posters || [];
  const details = listRes?.data?.data || [];

  const handleAmountClick = (val) => {
    setAmount(val.toString());
  };

  const handleDownloadQR = (invoice, amountVal) => {
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&data=${encodeURIComponent(`https://cash.app/launch/lightning/${invoice}`)}`;
    toast.info("Preparing QR Code image...");

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 600;
      canvas.height = 600;
      const ctx = canvas.getContext("2d");

      // Draw the QR Code image
      ctx.drawImage(img, 0, 0, 600, 600);

      // Draw the Cash App central logo overlay (Green rounded square with white border and $ symbol)
      const logoSize = 100;
      const x = (600 - logoSize) / 2;
      const y = (600 - logoSize) / 2;

      // Draw rounded rectangle for white border
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      const radiusWhite = 28;
      const wWhite = logoSize + 12;
      const hWhite = logoSize + 12;
      const xWhite = x - 6;
      const yWhite = y - 6;
      ctx.moveTo(xWhite + radiusWhite, yWhite);
      ctx.lineTo(xWhite + wWhite - radiusWhite, yWhite);
      ctx.quadraticCurveTo(xWhite + wWhite, yWhite, xWhite + wWhite, yWhite + radiusWhite);
      ctx.lineTo(xWhite + wWhite, yWhite + hWhite - radiusWhite);
      ctx.quadraticCurveTo(xWhite + wWhite, yWhite + hWhite, xWhite + wWhite - radiusWhite, yWhite + hWhite);
      ctx.lineTo(xWhite + radiusWhite, yWhite + hWhite);
      ctx.quadraticCurveTo(xWhite, yWhite + hWhite, xWhite, yWhite + hWhite - radiusWhite);
      ctx.lineTo(xWhite, yWhite + radiusWhite);
      ctx.quadraticCurveTo(xWhite, yWhite, xWhite + radiusWhite, yWhite);
      ctx.closePath();
      ctx.fill();

      // Draw rounded rectangle for green square
      ctx.fillStyle = "#00D632";
      ctx.beginPath();
      const radiusGreen = 24;
      ctx.moveTo(x + radiusGreen, y);
      ctx.lineTo(x + logoSize - radiusGreen, y);
      ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + radiusGreen);
      ctx.lineTo(x + logoSize, y + logoSize - radiusGreen);
      ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - radiusGreen, y + logoSize);
      ctx.lineTo(x + radiusGreen, y + logoSize);
      ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - radiusGreen);
      ctx.lineTo(x, y + radiusGreen);
      ctx.quadraticCurveTo(x, y, x + radiusGreen, y);
      ctx.closePath();
      ctx.fill();

      // Draw white '$' symbol in the center
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "bold 64px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", 300, 300);

      // Trigger download
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `qr-payment-${amountVal || "code"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success("QR Code downloaded successfully!");
    };
    img.onerror = () => {
      toast.error("Failed to load QR image for download. Please try again.");
    };
    img.src = qrUrl;
  };

  const handleGenerateQR = async (e) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/qrcode/create-manual/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description: description,
          isAdmin: !!admin,
        }),
      });

      const data = await response.json();
      if (data && data.success) {
        toast.success("Manual QR Code Generated Successfully!");
        setGeneratedQR(data.data);
        setAmount("");
        setDescription("");
        refetchList();
      } else {
        toast.error(data.error || "Failed to generate QR Code");
      }
    } catch (error) {
      console.error("Manual QR generate failed:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCheckStatus = async (infoId) => {
    setCheckingIds((prev) => ({ ...prev, [infoId]: true }));
    try {
      const res = await fetch(`${API_URL}/payment/check/${infoId}`);
      const data = await res.json();
      if (data && data.success) {
        toast.success("Payment verified & marked as Paid!");
        refetchList();
        if (generatedQR && generatedQR._id === infoId) {
          setGeneratedQR((prev) => ({ ...prev, status: true }));
        }
        if (viewingQRRecord && viewingQRRecord._id === infoId) {
          setViewingQRRecord((prev) => ({ ...prev, status: true }));
        }
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

  const handleViewQR = (record) => {
    setViewingQRRecord(record);
  };

  // Client-side filtering of the table rows
  const filteredDetails = useMemo(() => {
    if (!details) return [];
    let result = details;

    // Filter by site === "manual-qr" if we only want manual ones,
    // but the prompt says "below there need a list where all generated qr code can be seen"
    // Let's filter to display only manual-qr or show all of them?
    // "below there need a list where all generated qr code can be seen"
    // Typically, in this system, the only QR codes are manual QR codes and the automated lightning payment ones.
    // So displaying all amounts/QR codes (which have a lightningInvoice) is perfect!
    result = result.filter((item) => !!item.lightningInvoice);

    // Poster/Creator filter
    if (admin && selectedPosterFilter !== "all") {
      if (selectedPosterFilter === "admin") {
        result = result.filter((item) => !item.root);
      } else {
        result = result.filter((item) => {
          const posterIdVal = item.root?._id || item.poster || item.posterId;
          return posterIdVal === selectedPosterFilter;
        });
      }
    }

    // Status filter
    if (selectedStatusFilter !== "all") {
      const targetPaid = selectedStatusFilter === "paid";
      result = result.filter((item) => {
        const isPaid = item.status === true || item.status === "true";
        return isPaid === targetPaid;
      });
    }

    return result;
  }, [details, selectedPosterFilter, selectedStatusFilter, admin]);

  const columns = useMemo(() => {
    return getTableColumns(admin, handleCheckStatus, checkingIds, handleViewQR);
  }, [admin, checkingIds]);

  return (
    <div className="relative font-sans text-gray-900 pb-12">
      {/* Page Title */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-[28px] text-custom-blue2">
          <FaQrcode />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Create QR Code</h1>
      </div>

      {/* Main Content Layout */}
      <div className="flex flex-col xl:flex-row gap-8 items-start mb-12">
        {/* Left Side: Create Form */}
        <div className="w-full xl:max-w-[480px] bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6 font-Montserrat">Create New QR Payment</h2>

          <form onSubmit={handleGenerateQR} className="space-y-6">
            {/* Amount Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Amount (USD)</label>
              <div className="bg-gray-50 border border-gray-150 rounded-[20px] px-5 py-4 flex items-center gap-3 focus-within:border-emerald-500 focus-within:bg-white transition-all shadow-inner">
                <span className="text-gray-400 text-2xl font-semibold">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-transparent text-gray-900 text-3xl font-extrabold outline-none w-full border-none placeholder-gray-300 font-sans"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Quick Amounts */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Quick amounts</label>
              <div className="flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => handleAmountClick(amt)}
                    className={`py-2.5 px-6 rounded-full border text-sm font-extrabold transition-all duration-200 ${
                      parseFloat(amount) === amt
                        ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
                {showMore &&
                  MORE_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handleAmountClick(amt)}
                      className={`py-2.5 px-6 rounded-full border text-sm font-extrabold transition-all duration-200 ${
                        parseFloat(amount) === amt
                          ? "border-emerald-500 bg-emerald-50 text-emerald-600 shadow-sm"
                          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                      }`}
                    >
                      ${amt}
                    </button>
                  ))}
              </div>

              <button
                type="button"
                onClick={() => setShowMore(!showMore)}
                className="inline-block text-[#00D632] hover:text-[#00b029] font-extrabold text-sm underline transition-all"
              >
                {showMore ? "Less amounts" : "More amounts"}
              </button>
            </div>

            {/* Description Field */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-600">Description (optional)</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. NewYork traffic or Texus traffic"
                className="w-full bg-gray-50 border border-gray-150 rounded-[20px] px-5 py-4 text-sm font-medium outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-inner text-gray-700"
              />
              <p className="text-xs text-gray-400 font-medium">This is for you to remember the transaction.</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00D632] hover:bg-[#00b029] disabled:opacity-50 text-white font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-green-100 hover:shadow-green-200 active:scale-98"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <FaQrcode className="text-lg" />
                  <span>Generate QR</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Side: Newly Generated QR Code display */}
        <div className="flex-1 w-full flex flex-col justify-center xl:self-stretch">
          {generatedQR ? (
            <div className="w-full bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-emerald-100 flex flex-col items-center justify-center relative overflow-hidden xl:h-full">
              {/* Green Neon Accent Line */}
              <div className="absolute left-0 right-0 top-0 h-1.5 bg-[#00D632]"></div>

              {/* QR Image Container (Larger with Cash App central logo overlay) */}
              <div className="relative p-5 bg-white border border-gray-100 rounded-[36px] w-[340px] h-[340px] flex items-center justify-center shadow-md mx-auto shrink-0 mb-4 select-all">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&data=${encodeURIComponent(`https://cash.app/launch/lightning/${generatedQR.lightningInvoice}`)}`}
                  alt="Payment QR"
                  className="w-full h-full object-contain"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00D632] w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg border-4 border-white">
                  <span className="text-white font-black text-2xl select-none">$</span>
                </div>
              </div>

              {/* Text label under QR */}
              <p className="text-sm font-semibold text-gray-500 mb-4 font-Montserrat">Scan the QR code to pay</p>

              {/* QR Info Details (Below QR code) */}
              <div className="w-full text-center space-y-4 max-w-[340px] mx-auto">
                <div>
                  <h3 className="text-3xl font-extrabold text-gray-900">${parseFloat(generatedQR.amount).toFixed(2)}</h3>
                  {generatedQR.email && (
                    <p className="text-sm font-semibold text-gray-500 mt-1">{generatedQR.email}</p>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold border border-yellow-100 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-ping"></span>
                    <span>{generatedQR.status ? "Paid" : "Pending Payment"}</span>
                  </div>
                </div>

                <div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedQR.lightningInvoice);
                        toast.success("Lightning Invoice copied!");
                      }}
                      className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 border border-gray-200 cursor-pointer"
                    >
                      <FaCopy />
                      <span>Copy Invoice</span>
                    </button>
                    <button
                      onClick={() => handleDownloadQR(generatedQR.lightningInvoice, generatedQR.amount)}
                      className="flex-1 py-3 bg-[#00D632] hover:bg-[#00b029] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                    >
                      <FaDownload />
                      <span>Download QR</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center xl:h-full min-h-[300px]">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-4 shadow-inner">
                <FaQrcode className="text-2xl" />
              </div>
              <h3 className="text-base font-bold text-gray-700 font-Montserrat">No QR Code Generated Yet</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-[260px]">
                Fill out the payment form on the left and click Generate QR to manually create a new payment invoice.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section: Transaction History List */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5 mb-5">
          <div>
            <h2 className="text-xl font-bold text-gray-900 font-Montserrat">Transaction History</h2>
            <p className="text-xs text-gray-400 font-medium mt-0.5">All generated lightning QR code invoice records</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status:</span>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            {/* Poster User Filter (Admin Only) */}
            {admin && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Creator:</span>
                <select
                  value={selectedPosterFilter}
                  onChange={(e) => setSelectedPosterFilter(e.target.value)}
                  className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-600 outline-none focus:border-emerald-500 cursor-pointer shadow-sm"
                >
                  <option value="all">All Creators</option>
                  <option value="admin">Admin Only</option>
                  {postersList.map((poster) => (
                    <option key={poster._id} value={poster._id}>
                      {poster.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Table List */}
        <Loader isLoading={listLoading}>
          {filteredDetails && filteredDetails.length > 0 ? (
            <Table columnsHeading={columns} usersData={filteredDetails} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <FaQrcode className="text-4xl text-gray-200 mx-auto mb-3" />
              <p className="text-sm font-semibold">No QR payment records found</p>
              <p className="text-xs text-gray-400 mt-1">Try relaxing filters or generating a new payment above.</p>
            </div>
          )}
        </Loader>
      </div>

      {/* Modal Popup: View QR Code details of past transactions */}
      {viewingQRRecord && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white w-full max-w-[420px] rounded-[32px] p-6 md:p-8 shadow-2xl relative border border-gray-100 flex flex-col items-center transition-transform scale-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={() => setViewingQRRecord(null)}
              className="absolute top-5 right-5 p-2 text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 rounded-full"
            >
              <MdOutlineClose className="text-lg" />
            </button>

            {/* QR Code Frame (Larger with Cash App central logo overlay) */}
            <div className="relative p-4 bg-white border border-gray-100 rounded-[36px] w-[300px] h-[300px] flex items-center justify-center shadow-md relative mb-4 select-all">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&ecc=H&data=${encodeURIComponent(`https://cash.app/launch/lightning/${viewingQRRecord.lightningInvoice}`)}`}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00D632] w-12 h-12 rounded-[16px] flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-white font-black text-xl select-none">$</span>
              </div>
            </div>

            <p className="text-sm font-semibold text-gray-500 mb-4 font-Montserrat">Scan the QR code to pay</p>

            <h3 className="text-lg font-bold text-gray-900 font-Montserrat mb-1">QR Code Payment</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">
              Created by: <span className="text-blue-600">{viewingQRRecord.root?.username || "Admin"}</span>
            </p>
            {viewingQRRecord.email && (
              <p className="text-xs text-gray-500 font-medium mb-3 italic">
                Note: {viewingQRRecord.email}
              </p>
            )}

            <h4 className="text-3xl font-extrabold text-emerald-600 mb-4">
              ${parseFloat(viewingQRRecord.amount).toFixed(2)}
            </h4>

            {/* Status Badge */}
            <div className="mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                viewingQRRecord.status === true || viewingQRRecord.status === "true"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-yellow-100 text-yellow-800 border border-yellow-200"
              }`}>
                {viewingQRRecord.status === true || viewingQRRecord.status === "true" ? "Paid" : "Pending"}
              </span>
            </div>

            {/* Invoice & Actions */}
            <div className="w-full max-w-[300px] mx-auto">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingQRRecord.lightningInvoice);
                    toast.success("Lightning Invoice copied!");
                  }}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 border border-gray-200 cursor-pointer active:scale-95"
                >
                  <FaCopy />
                  <span>Copy Invoice</span>
                </button>
                <button
                  onClick={() => handleDownloadQR(viewingQRRecord.lightningInvoice, viewingQRRecord.amount)}
                  className="flex-1 py-3 bg-[#00D632] hover:bg-[#00b029] text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 active:scale-95 shadow-sm cursor-pointer"
                >
                  <FaDownload />
                  <span>Download QR</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
