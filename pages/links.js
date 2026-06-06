import { useSession } from "next-auth/react";
import { FaGlobe } from "react-icons/fa";
import AdminLinks from "../components/Links/AdminLinks";
import PosterLinks from "../components/Links/PosterLinks";

function LinksPage() {
  const { data: session } = useSession();
  const { id, admin } = session ? session.user : "";

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaGlobe />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Links</h1>
      </div>

      {admin ? (
        <AdminLinks id={id} admin={admin && 1} />
      ) : (
        <PosterLinks id={id} admin={!admin && 0} />
      )}
    </div>
  );
}

export default LinksPage;
