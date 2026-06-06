import React, { useState } from "react";
import useGetData from "../hooks/useGetData";
import { API_URL } from "../config";
import { toast } from "react-toastify";
import Loader from "./common/Loader";
import { FaMoneyCheckAlt } from "react-icons/fa";
import { getTimeDistance } from "../utils/getTimeDistance";

const WithdrawModule = ({ id, admin }) => {
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { data: summaryData, isLoading: summaryLoading, refetch: refetchSummary } = useGetData(
    id ? `/withdraw/summary/${id}` : null
  );

  const { data: listData, isLoading: listLoading, refetch: refetchList } = useGetData(
    id ? `/withdraw/list/${id}` : null
  );

  const handleWithdrawRequest = async (e) => {
    e.preventDefault();
    if (!withdrawAmount || isNaN(withdrawAmount) || Number(withdrawAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/withdraw/request/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(withdrawAmount) })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Withdraw request submitted successfully!");
        setWithdrawAmount("");
        refetchSummary();
        refetchList();
      } else {
        toast.error(data.error || "Failed to submit request");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (withdrawId, status) => {
    try {
      const res = await fetch(`${API_URL}/withdraw/update-status/${withdrawId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success(`Withdraw request ${status}!`);
        refetchSummary();
        refetchList();
      } else {
        toast.error(data.error || "Failed to update status");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    }
  };

  const summary = summaryData?.data || {};
  const withdraws = listData?.data?.data || [];

  if (summaryLoading || listLoading) {
    return <Loader isLoading={true} />;
  }

  return (
    <div className="mb-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-gray-800">${(summary.paidAmount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Paid Amount (Earned)</p>
          <p className="text-2xl font-bold text-green-600">${(summary.paidAmount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Available to Withdraw</p>
          <p className="text-2xl font-bold text-blue-600">${(summary.availableAmount || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Pending Withdraw</p>
          <p className="text-2xl font-bold text-yellow-600">${(summary.pendingWithdraw || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Total Withdrawn</p>
          <p className="text-2xl font-bold text-emerald-600">${(summary.totalWithdrawn || 0).toFixed(2)}</p>
        </div>
        <div className="bg-white p-5 rounded-lg shadow border border-gray-100">
          <p className="text-gray-500 text-sm font-medium">Last Withdraw</p>
          <p className="text-2xl font-bold text-gray-700">${(summary.lastWithdraw || 0).toFixed(2)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Withdraw Request Form */}
        {!admin && (
          <div className="bg-white p-6 rounded-lg shadow border border-gray-100 col-span-1 h-fit">
            <div className="flex items-center gap-2 mb-4">
              <FaMoneyCheckAlt className="text-blue-500 text-xl" />
              <h2 className="text-lg font-bold text-gray-800">Request Withdraw</h2>
            </div>
            <form onSubmit={handleWithdrawRequest}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    max={summary.availableAmount || 0}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="pl-8 w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm py-2 px-3 border"
                    placeholder="0.00"
                    disabled={isSubmitting || (summary.availableAmount || 0) <= 0}
                  />
                </div>
                {(summary.availableAmount || 0) <= 0 && (
                  <p className="text-xs text-red-500 mt-1">Insufficient balance to withdraw.</p>
                )}
              </div>
              <button
                type="submit"
                disabled={isSubmitting || (summary.availableAmount || 0) <= 0 || !withdrawAmount}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
              </button>
            </form>
          </div>
        )}

        {/* Withdraw History */}
        <div className={`bg-white p-6 rounded-lg shadow border border-gray-100 ${admin ? 'col-span-3' : 'col-span-2'}`}>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Withdraw History</h2>
          {withdraws.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    {admin && <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {withdraws.map((w) => (
                    <tr key={w._id}>
                      <td className="px-4 py-3 whitespace-nowrap font-bold text-gray-800">
                        ${w.amount.toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${w.status === 'approved' ? 'bg-green-100 text-green-800' : 
                            w.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {w.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {getTimeDistance(w.createdAt)}
                      </td>
                      {admin && (
                        <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                          {w.status === 'pending' ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleUpdateStatus(w._id, 'approved')}
                                className="text-white bg-green-500 hover:bg-green-600 px-2 py-1 rounded text-xs"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(w._id, 'rejected')}
                                className="text-white bg-red-500 hover:bg-red-600 px-2 py-1 rounded text-xs"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Processed</span>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No withdraw history found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default WithdrawModule;
