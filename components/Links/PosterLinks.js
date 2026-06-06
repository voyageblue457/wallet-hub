import React from "react";
import { FaCopy, FaExternalLinkAlt, FaTrashAlt } from "react-icons/fa";
import Loader from "../common/Loader";
import useGetData from "../../hooks/useGetData";
import Tabs from "../Tabs";
import PosterDynamicLinkForm from "../Form/PosterDynamicLinkForm";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../../config";

function PosterLinks({ id, admin }) {
  // Fetch assigned base links
  const { data: fetchedBaseData, isLoading: isBaseLoading } = useGetData(
    `/link/get/all/hello/world/com/data/${id}/${admin}`,
  );
  const activeSites = fetchedBaseData?.data?.data;

  // Fetch dynamic links created by the poster
  const {
    data: fetchedDynamicLinks,
    refetch: refetchDynamicLinks,
    isLoading: isLinksLoading,
  } = useGetData(`/dynamic-link/get/${id}`);

  const dynamicLinks =
    fetchedDynamicLinks?.data?.data || fetchedDynamicLinks?.data;

  // Fetch poster details to get the saved tag
  const { data: posterData } = useGetData(`/posters/details/${id}`);
  const tag = posterData?.data?.data?._doc?.tag || "";

  const handleCopy = (linkName) => {
    if (linkName) {
      navigator.clipboard.writeText(linkName);
      toast.success("Link copied to clipboard!");
    } else {
      toast.error("Link not found");
    }
  };

  const handleDelete = async (linkId) => {
    if (window.confirm("Are you sure you want to delete this dynamic link?")) {
      try {
        await axios.delete(`${API_URL}/dynamic-link/delete/${linkId}`);
        toast.success("Dynamic link deleted successfully");
        refetchDynamicLinks();
      } catch (err) {
        toast.error("Failed to delete dynamic link");
      }
    }
  };

  const tabsData = [
    {
      label: "All Links",
      content: (
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-custom-blue5"></span>
            Your Created Links
          </h2>

          {isLinksLoading ? (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm animate-pulse">
                Loading links...
              </p>
            </div>
          ) : Array.isArray(dynamicLinks) && dynamicLinks.length > 0 ? (
            <div className="overflow-x-auto rounded-lg border border-gray-100 shadow-sm bg-white">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 font-semibold uppercase text-xs">
                    <th className="py-4 px-6">Dynamic Link</th>
                    <th className="py-4 px-6">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {dynamicLinks.map((link) => (
                    <tr
                      key={link?._id}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-mono text-custom-blue5 font-medium select-all break-all">
                        {link?.linkName || ""}
                      </td>
                      <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                        {link?.createdAt
                          ? new Date(link.createdAt).toLocaleString()
                          : "N/A"}
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleCopy(link?.linkName)}
                            className="p-2 text-gray-500 hover:text-custom-blue5 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Copy to clipboard"
                          >
                            <FaCopy className="w-4 h-4" />
                          </button>
                          <a
                            href={
                              link?.linkName && link.linkName.startsWith("http")
                                ? link.linkName
                                : `https://${link?.linkName || ""}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 text-gray-500 hover:text-green-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Open in new tab"
                          >
                            <FaExternalLinkAlt className="w-4 h-4" />
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDelete(link?._id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                            title="Delete link"
                          >
                            <FaTrashAlt className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">
                No links created yet. Go to "Create Link" tab to add one!
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      label: "Create Link",
      content: (
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <PosterDynamicLinkForm
            id={id}
            assignedLinks={activeSites}
            refetchDynamicLinks={refetchDynamicLinks}
          />
        </div>
      ),
    },
    {
      label: "Your Tag",
      content: (
        <div className="mt-7 bg-white p-4 lg:p-8 rounded shadow-md">
          <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-custom-blue5"></span>
            Your QR Tag
          </h2>
          {tag ? (
            <div className="max-w-md bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-sm">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Active Tag
              </p>
              <div className="flex items-center justify-between bg-white border border-gray-100 rounded-xl p-4">
                <span className="font-mono text-custom-blue5 font-semibold text-base break-all">
                  {tag}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(tag)}
                  className="p-2 text-gray-500 hover:text-custom-blue5 hover:bg-gray-100 rounded-lg transition cursor-pointer shrink-0 ml-4"
                  title="Copy Tag"
                >
                  <FaCopy className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-4 leading-relaxed">
                This tag is used for generating dynamic QR codes and link identifiers for secure payment processing.
              </p>
            </div>
          ) : (
            <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
              <p className="text-gray-500 text-sm">
                No active tag set for this poster.
              </p>
            </div>
          )}
        </div>
      ),
    }
  ];

  return (
    <div className="relative">
      <Loader isLoading={isBaseLoading}>
        <Tabs tabsData={tabsData} />
      </Loader>
    </div>
  );
}

export default PosterLinks;
