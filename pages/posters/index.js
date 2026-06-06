import { getSession, useSession } from "next-auth/react";
import { useState } from "react";
import { FaUsers } from "react-icons/fa";
import Loader from "../../components/common/Loader";
import PosterForm from "../../components/Form/PosterForm";
import DynamicLinkForm from "../../components/Form/DynamicLinkForm";
import TagForm from "../../components/Form/TagForm";
import Table from "../../components/Table";
import { postersColumn } from "../../components/Table/columns/postersColumn";
import Tabs from "../../components/Tabs";
// import { API_URL, id, adminId } from "../../config";
import useGetData from "../../hooks/useGetData";
import { getTimeDistance } from "./../../utils/getTimeDistance";

// const userData = [
//   { username: "user1", password: "1234", posterId: "001" },
//   { username: "user2", password: "1234", posterId: "002" },
//   { username: "user3", password: "1234", posterId: "003" },
//   { username: "user4", password: "1234", posterId: "004" },
//   { username: "user5", password: "1234", posterId: "005" },
// ];

function Posterspage() {
  // const { data: session } = useSession({ required: true });
  const { data: session } = useSession();
  const { id, username, admin, adminId } = session
    ? session.user
    : "";

  const {
    data: fetchedData,
    isLoading,
    isError,
  } = useGetData(`/all/poster/${id}`);
  // console.log("postersss", fetchedData);

  // console.log("session", session);

  // console.log(
  //   "fetchedddd",
  //   fetchedData?.data?.data?.createdAt
  //   // getTimeDistance(fetchedData?.data?.data?.createdAt)
  // );

  const userData = fetchedData?.data?.data?.posters;

  // console.log("userData", userData);

  // console.log("ppp", fetchedData.data?.[0].posters);
  const table = userData && (
    <Table columnsHeading={postersColumn} usersData={userData} />
  );
  const form = <PosterForm id={id} adminId={adminId} />;

  const tabsData = [
    {
      label: "All Users",
      content: table,
    },
    {
      label: "Add User",
      content: form,
    },
    {
      label: "Create Link",
      content: <DynamicLinkForm id={id} />,
    },
  ];

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaUsers />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Users</h1>
      </div>

      <Loader isLoading={isLoading}>
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <Tabs tabsData={tabsData} />
        </div>
      </Loader>
    </div>
  );
}

// export async function getServerSideProps(context) {
//   // const {
//   //   user: { username, id, admin },
//   // } = await getSession(context);

//   // const session = getSession(context);

//   // console.log("server", session);

//   // const url = `${API_URL}/linl/all/${id}`;
//   //      const res = await fetch(url);
//   //      const data = await res.json();

//   // if (!admin) {
//   //   return {
//   //     notFound: true,
//   //   };
//   // }

//   return {
//     props: {},
//   };
// }

export default Posterspage;
