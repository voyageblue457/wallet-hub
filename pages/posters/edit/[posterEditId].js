import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React from "react";
import { FaUser } from "react-icons/fa";
import Loader from "../../../components/common/Loader";
import EditPosterForm from "../../../components/Form/EditPosterForm";
import useGetData from "../../../hooks/useGetData";

function PosterEditPage() {
  const { data: session } = useSession();
  const { id, admin, adminId } = session ? session.user : "";

  const {
    back,
    query: { posterEditId },
  } = useRouter();

  const { data: fetchedData, isLoading } = useGetData(
    `/posters/details/${posterEditId}`
  );

  // const username = fetchedData?.data?.data?.username;
  // const password = fetchedData?.data?.data?.password;
  // const posterId = fetchedData?.data?.data?.posterId;
  // const yourLinks = fetchedData?.data?.data?.links;

  const username = fetchedData?.data?.data?._doc.username;
  const password = fetchedData?.data?.data?._doc.password;
  const yourLinks = fetchedData?.data?.data?._doc.links;

  const { data: fetchedLinks, isLoading: isLoading2 } = useGetData(
    `/link/get/${id}`
  );

  const allLinks = fetchedLinks?.data?.users;

  const linksAvailable = allLinks?.filter((link) => {
    const newLink = `${link}/${adminId}`;
    return !yourLinks?.includes(newLink);
  });

  console.log("yourlinks", yourLinks);

  console.log("allLinks", allLinks);

  console.log("LinksAvailable", linksAvailable);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaUser />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Edit Poster</h1>
      </div>

      <div className="my-5">
        <span
          className="text-sm text-blue-700 hover:text-blue-900 cursor-pointer"
          onClick={() => back()}
        >
          {"<"} Go Back
        </span>
      </div>

      <Loader isLoading={isLoading || isLoading2}>
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <EditPosterForm
            id={id}
            posterEditId={posterEditId}
            adminId={adminId}
            username={username}
            password={password}
            yourLinks={yourLinks}
            linksAvailable={linksAvailable}
          />
        </div>
      </Loader>
    </div>
  );
}

export default PosterEditPage;
