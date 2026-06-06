import { useSession } from "next-auth/react";
import { FaMoneyCheckAlt } from "react-icons/fa";
import WithdrawModule from "../components/WithdrawModule";

function WithdrawPage() {
  const { data: session } = useSession();
  const admin = session?.user?.admin;
  const id = admin ? session?.user?.adminId : (session?.user?.posterId || session?.user?.id);

  return (
    <div className="relative">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[28px] text-custom-blue2">
          <FaMoneyCheckAlt />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">
          Withdrawals
        </h1>
      </div>
      
      <div>
        {id ? (
          <WithdrawModule id={id} admin={admin} />
        ) : (
          <p className="text-gray-500">Loading user data...</p>
        )}
      </div>
    </div>
  );
}

export default WithdrawPage;
