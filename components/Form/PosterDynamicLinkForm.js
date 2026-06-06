import * as Yup from "yup";
import { Form, Formik } from "formik";
import usePostData from "../../hooks/usePostData";
import { TextField } from "../common/InputField";
import { toast } from "react-toastify";
import useGetData from "../../hooks/useGetData";
import { FaCopy, FaExternalLinkAlt, FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../../config";

function PosterDynamicLinkForm({ id, assignedLinks, refetchDynamicLinks: parentRefetch }) {
  const { mutate, isLoading } = usePostData({
    path: "/link/add",
  });

  // Fetch dynamic links created by the poster
  const { 
    data: fetchedDynamicLinks, 
    refetch: refetchDynamicLinks, 
    isLoading: isLinksLoading 
  } = useGetData(`/dynamic-link/get/${id}`);
  
  const dynamicLinks = fetchedDynamicLinks?.data?.data || fetchedDynamicLinks?.data;

  const initialValues = {
    baseLink: "",
    path: "",
  };

  const validate = Yup.object({
    baseLink: Yup.string().required("Base Link is required"),
    path: Yup.string().required("Path is required"),
  });

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
        if (parentRefetch) parentRefetch();
      } catch (err) {
        toast.error("Failed to delete dynamic link");
      }
    }
  };

  const handleSubmit = (values, formik) => {
    let base = values.baseLink || "";
    if (base.endsWith("/")) {
      base = base.slice(0, -1);
    }
    let customPath = (values.path || "").trim();
    if (customPath && !customPath.startsWith("/")) {
      customPath = "/" + customPath;
    }
    const combinedLinkName = `${base}${customPath}`;

    if (!base) {
      toast.error("Base Link is required");
      return;
    }

    const submitValues = {
      linkName: combinedLinkName,
      targetUrl: "",
      root: id,
    };

    mutate(submitValues, {
      onSuccess: () => {
        toast.success("Dynamic link created/updated successfully");
        formik.resetForm();
        refetchDynamicLinks();
        if (parentRefetch) parentRefetch();
      },
    });
  };

  return (
    <div className="mt-7">
      <Formik
        initialValues={initialValues}
        validationSchema={validate}
        onSubmit={handleSubmit}
      >
        {(formik) => (
          <Form>
            <h1 className="text-lg font-semibold ">Create Dynamic Link</h1>
            <p className="text-sm text-gray-500 mt-1">
              Select one of your assigned links and set a custom path to build your dynamic link.
            </p>
            <div className="pt-7 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-7">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 mb-1">
                  Select Base Link *
                </label>
                <select
                  name="baseLink"
                  className="p-2.5 w-full outline-none text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow"
                  onChange={formik.handleChange}
                  value={formik.values.baseLink}
                >
                  <option value="" disabled>
                    Select a link
                  </option>
                  {assignedLinks?.map((link, i) => (
                    <option key={i} value={link}>
                      {typeof link === 'string' ? link.split("https://").join("") : String(link)}
                    </option>
                  ))}
                </select>
                {formik.errors.baseLink && formik.touched.baseLink && (
                  <p className="text-xs text-red-600 mt-1">
                    {formik.errors.baseLink}
                  </p>
                )}
              </div>
              <TextField
                label="Path (e.g. /rahim, /rcho) *"
                name="path"
                type="text"
                placeholder="/rahim"
              />
            </div>

            {formik.values.baseLink && formik.values.path && (
              <div className="mt-5 p-4 bg-gray-50 rounded border border-gray-200 text-sm">
                <span className="font-semibold text-gray-700">Preview Dynamic Link: </span>
                <code className="text-custom-blue5 font-mono bg-white px-2 py-1 rounded border border-gray-200 ml-1">
                  {`${formik.values.baseLink}${formik.values.path?.startsWith("/") ? "" : "/"}${formik.values.path}`}
                </code>
              </div>
            )}

            <div className="mt-10 flex justify-start">
              <button
                type="submit"
                className="px-9 py-4 text-white text-xs tracking-widest font-bold rounded bg-custom-blue5 hover:bg-custom-blue active:scale-95 transition duration-300 uppercase disabled:bg-opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Create Link
              </button>
            </div>
          </Form>
        )}
      </Formik>

      {/* List of Dynamic Links */}
      <div className="mt-14 border-t border-gray-150 pt-10">
        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-custom-blue5"></span>
          Your Created Dynamic Links
        </h2>

        {isLinksLoading ? (
          <div className="text-center py-10 px-4 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            <p className="text-gray-500 text-sm animate-pulse">Loading dynamic links...</p>
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
                  <tr key={link?._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-custom-blue5 font-medium select-all break-all">
                      {link?.linkName || ""}
                    </td>
                    <td className="py-4 px-6 text-gray-500 whitespace-nowrap">
                      {link?.createdAt ? new Date(link.createdAt).toLocaleString() : "N/A"}
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
                          href={link?.linkName && link.linkName.startsWith("http") ? link.linkName : `https://${link?.linkName || ""}`}
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
            <p className="text-gray-500 text-sm">No dynamic links created yet. Use the form above to create one!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PosterDynamicLinkForm;
