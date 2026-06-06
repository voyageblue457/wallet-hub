import Loader from "../common/Loader";
import Table from "../Table";
import { linkColumn } from "../Table/columns/linkColumn";
import useGetData from "../../hooks/useGetData";

function AdminLinks({ id, admin }) {
  const { data: fetchedData, isLoading } = useGetData(
    `/link/get/all/hello/world/com/data/${id}/${admin}`
  );

  // const allSites = fetchedData?.data?.sites;
  const activeSites = fetchedData?.data?.data;

  // console.log("activesites", activeSites);

  // const linksData = allSites?.map((site) => {
  //   const checkStatus = () => {
  //     if (activeSites?.includes(site.name)) {
  //       return "Active";
  //     } else {
  //       return "Inactive";
  //     }
  //   };

  //   return {
  //     site: site.name,
  //     status: checkStatus(),
  //   };
  // });

  const linksData = activeSites?.map((site) => {
    return {
      site: site,
    };
  });

  return (
    <div className="relative">
      <Loader isLoading={isLoading}>
        <div className="mt-7 bg-white p-4 lg:p-8  rounded shadow-md">
          <h4 className="text-xl font-semibold">All Links</h4>
          {linksData && (
            <Table columnsHeading={linkColumn} usersData={linksData} />
          )}
        </div>
      </Loader>
    </div>
  );
}

export default AdminLinks;
