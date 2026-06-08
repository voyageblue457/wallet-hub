import { useState, useEffect } from "react";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import usePostData from "../../hooks/usePostData";
import { TextField } from "../common/InputField";
import { toast } from "react-toastify";
import useGetData from "../../hooks/useGetData";
import axios from "axios";
import { API_URL } from "../../config";
import { FaCopy, FaExternalLinkAlt, FaTrashAlt } from "react-icons/fa";
import { useQRCode } from "next-qrcode";

function DynamicLinkForm({ id }) {
  const { mutate, isLoading } = usePostData({
    path: "/link/add",
    revalidate: `/link/get/${id}`,
  });

  const { Canvas } = useQRCode();

  const [generatedQrs, setGeneratedQrs] = useState({});
  const [generatingLinkId, setGeneratingLinkId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLink, setModalLink] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("generated_qrs");
      if (saved) {
        try {
          setGeneratedQrs(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to parse generated_qrs from localStorage", e);
        }
      }
    }
  }, []);

  const markAsGenerated = (linkId) => {
    const updated = { ...generatedQrs, [linkId]: true };
    setGeneratedQrs(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("generated_qrs", JSON.stringify(updated));
    }
  };

  const handleGenerateQR = (linkId) => {
    setGeneratingLinkId(linkId);
    setTimeout(() => {
      markAsGenerated(linkId);
      setGeneratingLinkId(null);
      toast.success("QR code generated!");
    }, 1000);
  };

  const getLastName = (linkName) => {
    if (!linkName) return "";
    const cleaned = linkName.endsWith('/') ? linkName.slice(0, -1) : linkName;
    const parts = cleaned.split('/');
    return parts[parts.length - 1] || "QR";
  };

  const handleDownloadQR = () => {
    const container = document.getElementById('qrcode-container');
    const canvas = container ? container.querySelector('canvas') : null;
    if (canvas) {
      // Create a temporary canvas so we don't modify the displayed canvas in DOM
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const ctx = tempCanvas.getContext("2d");

      // Draw the QR Code image
      ctx.drawImage(canvas, 0, 0);

      // Draw the Cash App central logo overlay (Green rounded square with white border and $ symbol)
      const qrSize = canvas.width;
      const logoSize = qrSize * 0.18; // ~18% of QR code width (safe for error correction level H)
      const x = (qrSize - logoSize) / 2;
      const y = (qrSize - logoSize) / 2;

      // Draw rounded rectangle for white border boundary
      ctx.fillStyle = "#FFFFFF";
      ctx.beginPath();
      const radiusWhite = logoSize * 0.28;
      const wWhite = logoSize + (qrSize * 0.02);
      const hWhite = logoSize + (qrSize * 0.02);
      const xWhite = x - (qrSize * 0.01);
      const yWhite = y - (qrSize * 0.01);
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
      const radiusGreen = logoSize * 0.24;
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
      ctx.font = `bold ${Math.round(logoSize * 0.64)}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("$", qrSize / 2, qrSize / 2);

      const pngUrl = tempCanvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.href = pngUrl;
      const lastName = getLastName(modalLink?.linkName) || "qrcode";
      downloadLink.download = `${lastName}-qrcode.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      toast.success("QR code downloaded successfully!");
    } else {
      toast.error("Could not download QR code");
    }
  };

  const { data: fetchedData } = useGetData(`/link/get/${id}`);
  const fetchedLinks = fetchedData?.data?.users || fetchedData?.users;

  const { data: fetchedDynamicLinks, refetch: refetchDynamicLinks, isLoading: isLinksLoading } = useGetData(
    `/dynamic-link/get/${id}`
  );
  const dynamicLinks = fetchedDynamicLinks?.data?.data || fetchedDynamicLinks?.data;

  const initialValues = {
    baseLink: "",
    path: "",
  };

  const validate = Yup.object({
    baseLink: Yup.string().required("Base Link is required"),
    path: Yup.string().required("Path is required"),
  });

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
      },
    });
  };

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
            <div className="pt-7 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-7">
              <div className="flex flex-col">
                <label className="font-semibold text-gray-600 mb-1">Select Base Link *</label>
                <select
                  name="baseLink"
                  className="p-2.5 w-full outline-none text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow"
                  onChange={formik.handleChange}
                  value={formik.values.baseLink}
                >
                  <option value="" disabled>Select a link</option>
                  {Array.isArray(fetchedLinks) && fetchedLinks.map((link, i) => (
                    <option key={i} value={link}>
                      {typeof link === 'string' ? link.split("https://").join("") : String(link)}
                    </option>
                  ))}
                </select>
                {formik.errors.baseLink && formik.touched.baseLink && (
                  <p className="text-xs text-red-600 mt-1">{formik.errors.baseLink}</p>
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
                  <th className="py-4 px-6">QR Code</th>
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
                    <td className="py-4 px-6 whitespace-nowrap">
                      {generatedQrs[link?._id] ? (
                        <button
                          type="button"
                          onClick={() => {
                            setModalLink(link);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 text-xs font-semibold rounded hover:bg-green-100 active:scale-95 transition duration-200"
                        >
                          View QR
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleGenerateQR(link?._id)}
                          disabled={generatingLinkId === link?._id}
                          className="px-3 py-1.5 bg-custom-blue5 text-white text-xs font-semibold rounded hover:bg-custom-blue active:scale-95 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
                        >
                          {generatingLinkId === link?._id ? (
                            <>
                              <svg className="animate-spin h-3.5 w-3.5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generating...
                            </>
                          ) : (
                            "Generate QR"
                          )}
                        </button>
                      )}
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

      {/* View QR Code Modal */}
      {isModalOpen && modalLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden transform transition-all duration-300 scale-100 flex flex-col items-center p-6 relative border border-gray-100">
            
            {/* Close button at top-right */}
            <button 
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              title="Close modal"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Pay Link Title */}
            <h3 className="text-xl font-bold text-gray-900 mt-2 mb-6 tracking-tight text-center">
              Pay link QR {getLastName(modalLink.linkName)}
            </h3>

            {/* QR Code container */}
            <div className="relative p-4 bg-white rounded-2xl border border-gray-100 shadow-md flex justify-center items-center select-all">
              <div id="qrcode-container" className="flex justify-center items-center">
                <Canvas
                  text={modalLink.linkName && modalLink.linkName.startsWith("http") ? modalLink.linkName : `https://${modalLink.linkName || ""}`}
                  options={{
                    errorCorrectionLevel: 'H',
                    margin: 3,
                    scale: 4,
                    width: 320,
                  }}
                />
              </div>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#00D632] w-14 h-14 rounded-[18px] flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-white font-black text-2xl select-none">$</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="mt-8 flex gap-3 w-full">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 active:scale-95 transition duration-200"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleDownloadQR}
                className="flex-1 px-4 py-3 bg-custom-blue5 text-white text-sm font-semibold rounded-xl hover:bg-custom-blue active:scale-95 transition duration-200 shadow-md shadow-blue-500/20"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DynamicLinkForm;
