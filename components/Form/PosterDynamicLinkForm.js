import { useState, useEffect } from "react";
import * as Yup from "yup";
import { Form, Formik } from "formik";
import usePostData from "../../hooks/usePostData";
import { TextField } from "../common/InputField";
import { toast } from "react-toastify";
import useGetData from "../../hooks/useGetData";
import { FaCopy, FaExternalLinkAlt, FaTrashAlt, FaLock, FaArrowRight, FaCheck } from "react-icons/fa";
import axios from "axios";
import { API_URL } from "../../config";
import { useQRCode } from "next-qrcode";

function PosterDynamicLinkForm({ id, assignedLinks, refetchDynamicLinks: parentRefetch }) {
  const { mutate, isLoading } = usePostData({
    path: "/link/add",
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
      ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - logoSize - radiusGreen, y + logoSize); // Wait, make sure we use a correct formula: x + logoSize - radiusGreen, y + logoSize
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
    theme: "Cash Green",
  };

  const validate = Yup.object({
    baseLink: Yup.string().required("Base Link is required"),
    path: Yup.string().required("Path is required"),
    theme: Yup.string().required("Theme is required"),
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
      theme: values.theme,
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
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 pt-7">
              {/* Form Inputs Column */}
              <div className="xl:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="flex flex-col">
                    <label className="font-semibold text-gray-600 mb-1">Select Template *</label>
                    <select
                      name="theme"
                      className="p-2.5 w-full outline-none text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow cursor-pointer"
                      onChange={formik.handleChange}
                      value={formik.values.theme}
                    >
                      <option value="Cash Green">Cash Green (Keypad)</option>
                      <option value="Payin Cash">Payin Cash (Preset Grid)</option>
                      <option value="Pay Cash App">Pay Cash App (Step Tabs)</option>
                      <option value="CashApp Dark">CashApp Dark (Keypad)</option>
                      <option value="CashApp Online">CashApp Online (Quick Select)</option>
                      <option value="Pay Isla">Pay Isla (Keypad)</option>
                    </select>
                    {formik.errors.theme && formik.touched.theme && (
                      <p className="text-xs text-red-600 mt-1">{formik.errors.theme}</p>
                    )}
                  </div>
                </div>

                {formik.values.baseLink && formik.values.path && (
                  <div className="p-4 bg-gray-50 rounded border border-gray-200 text-sm">
                    <span className="font-semibold text-gray-700">Preview Dynamic Link: </span>
                    <code className="text-custom-blue5 font-mono bg-white px-2 py-1 rounded border border-gray-200 ml-1">
                      {`${formik.values.baseLink}${formik.values.path?.startsWith("/") ? "" : "/"}${formik.values.path}`}
                    </code>
                  </div>
                )}

                <div className="flex justify-start">
                  <button
                    type="submit"
                    className="px-9 py-4 text-white text-xs tracking-widest font-bold rounded bg-custom-blue5 hover:bg-custom-blue active:scale-95 transition duration-300 uppercase disabled:bg-opacity-50 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    Create Link
                  </button>
                </div>
              </div>

              {/* Live Preview Mockup Column */}
              <div className="xl:col-span-1 flex flex-col items-center justify-start bg-slate-50 border border-gray-100 rounded-3xl p-4 shadow-inner min-h-[350px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-3 block">
                  {formik.values.theme || "Cash Green"} Live Preview
                </span>
                
                {/* Mobile mockup */}
                <div className="w-[190px] h-[300px] bg-white rounded-[24px] shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col justify-between text-left select-none">
                  {/* Speaker Notch */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-slate-800 rounded-full z-20"></div>

                  {/* CASH GREEN / CASHAPP DARK / PAY ISLA */}
                  {(formik.values.theme === "Cash Green" || formik.values.theme === "CashApp Dark" || formik.values.theme === "Pay Isla") && (
                    <div className="h-full w-full bg-[#00D632] text-white flex flex-col justify-between p-2.5 text-[7px]">
                      <div className="flex justify-between items-center mt-1 scale-90">
                        <div className="bg-white text-[#00D632] rounded font-bold px-1 py-0.5">C</div>
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-[8px]">
                            {formik.values.theme === "CashApp Dark" ? "Pay $username" :
                             formik.values.theme === "Pay Isla" ? "Pay Isla" : "Cash Green"}
                          </span>
                          <span className="bg-[#00b029] px-1.5 py-0.5 rounded-full text-[5px] border border-white/10 scale-90 flex items-center gap-0.5">
                            <FaCheck className="text-[4px]" /> Secure
                          </span>
                        </div>
                        <div className="w-2"></div>
                      </div>

                      <div className="bg-white/10 border border-white/15 rounded-xl p-1 flex flex-col items-center text-center mt-1 scale-95">
                        <span className="font-bold text-[7px]">Cash App</span>
                        <span className="text-[5px] text-white/70">Instant</span>
                      </div>

                      <div className="text-center my-1 scale-90">
                        <h2 className="text-xl font-black">$0</h2>
                        <p className="text-[5px] tracking-wider text-white/70 uppercase">USD</p>
                      </div>

                      <div className="grid grid-cols-3 gap-1 w-full max-w-[130px] mx-auto scale-90">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<-"].map((k) => (
                          <div key={k} className="h-4.5 rounded bg-white/10 border border-white/5 flex items-center justify-center text-[7px] font-bold">
                            {k}
                          </div>
                        ))}
                      </div>

                      <button type="button" className="w-full py-1.5 bg-[#009c24] text-white font-extrabold rounded-lg text-[8px] scale-95">
                        Pay
                      </button>
                    </div>
                  )}

                  {/* PAYIN CASH */}
                  {formik.values.theme === "Payin Cash" && (
                    <div className="h-full w-full bg-slate-50 text-gray-800 flex flex-col justify-between p-2.5 text-[7px]">
                      <div className="flex justify-between items-center mt-1 border-b border-gray-100 pb-1">
                        <div className="w-4 h-4 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-[7px]">C</div>
                        <div className="border border-gray-200 px-1.5 py-0.5 bg-white text-gray-550 rounded-full scale-75">Secure</div>
                      </div>

                      <div className="bg-white border border-gray-100 rounded-xl p-2 flex-1 flex flex-col justify-between mt-1.5 shadow-sm scale-95">
                        <div className="text-center">
                          <p className="font-extrabold text-[8px]">Payin Cash</p>
                          <div className="inline-flex items-center gap-0.5 bg-emerald-50 text-[#05b875] px-1.5 py-0.5 rounded-full text-[5px] border border-emerald-100 mt-0.5">
                            Secure Payment
                          </div>
                        </div>
                        <div className="border border-gray-100 rounded-lg p-1 text-center text-gray-400 text-[6px]">
                          Enter amount
                        </div>
                        <div className="grid grid-cols-3 gap-0.5 mt-0.5">
                          {["$10", "$50", "$100"].map(v => (
                            <div key={v} className="py-0.5 border border-gray-250 bg-white rounded text-center text-[6px] font-bold">{v}</div>
                          ))}
                        </div>
                      </div>

                      <button type="button" className="w-full mt-1.5 py-1.5 bg-[#05b875] text-white font-extrabold rounded-lg text-[8px] flex items-center justify-center gap-1 scale-95">
                        <FaLock className="text-[5px]" /> Pay Now
                      </button>
                    </div>
                  )}

                  {/* PAY CASH APP */}
                  {formik.values.theme === "Pay Cash App" && (
                    <div className="h-full w-full bg-white text-gray-800 flex flex-col justify-between p-2.5 text-[7px]">
                      <div className="flex justify-between items-center mt-1 border-b border-gray-150 pb-1">
                        <div className="bg-[#00D632] w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-black">$</div>
                        <div className="border border-gray-250 px-1.5 py-0.5 bg-white text-gray-500 rounded-full scale-75">Secure</div>
                      </div>

                      <div className="text-center mt-1 flex flex-col items-center scale-90">
                        <div className="w-5 h-5 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-xs mb-0.5">C</div>
                        <span className="font-extrabold text-[7px]">@theme-preview</span>
                        <span className="text-[4px] text-gray-400 max-w-[120px] leading-tight block mt-0.5">Do not send Cash App to this name.</span>
                      </div>

                      <div className="bg-white border border-gray-100 shadow-sm rounded-lg p-2 mt-1 flex-1 flex flex-col justify-between scale-95">
                        <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-full p-0.5 scale-90">
                          <div className="flex items-center gap-0.5 bg-white border border-gray-100 px-1.5 py-0.5 rounded-full font-bold text-[5px]">
                            Amount
                          </div>
                          <div className="px-1.5 font-bold text-[5px] text-gray-400">
                            Pay
                          </div>
                        </div>

                        <div className="border border-gray-100 bg-slate-50 rounded p-1 px-1.5 flex items-center gap-1 scale-90 mt-1">
                          <span className="text-emerald-500 font-bold text-[7px]">$</span>
                          <span className="text-gray-800 font-extrabold text-[7px]">0.00</span>
                        </div>

                        <div className="flex gap-0.5 justify-center scale-90">
                          {["$10", "$15", "$20"].map(v => (
                            <div key={v} className="px-1 py-0.5 border border-gray-250 bg-white text-[#555] rounded-full text-[5px] font-bold">{v}</div>
                          ))}
                        </div>
                      </div>

                      <button type="button" className="w-full mt-1.5 py-1.5 bg-[#0f172a] text-white font-extrabold rounded-lg text-[8px] flex items-center justify-center gap-1 scale-95">
                        <span>Continue</span> <FaArrowRight className="text-[5px]" />
                      </button>
                    </div>
                  )}

                  {/* CASHAPP ONLINE */}
                  {formik.values.theme === "CashApp Online" && (
                    <div className="h-full w-full bg-[#f4f6f8] text-gray-800 flex flex-col justify-between p-2.5 text-[7px]">
                      <div className="flex justify-between items-center mt-1 pb-1">
                        <div className="w-4 h-4 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-[8px]">C</div>
                        <div className="border border-gray-205 px-1.5 py-0.5 bg-white text-gray-500 rounded-full scale-75">Secure</div>
                      </div>

                      <div className="bg-white border border-gray-105 rounded-xl p-1.5 flex-1 flex flex-col justify-between mt-1 shadow-sm scale-95">
                        <div className="text-center">
                          <p className="font-extrabold text-[7px]">Pay CashApp</p>
                          <div className="inline-flex items-center gap-0.5 bg-[#ccf7e1] text-[#00b0ff] px-1 py-0.5 rounded-full text-[4px] border border-emerald-100 scale-90">
                            Secure Payment
                          </div>
                        </div>

                        <div className="border border-gray-100 rounded py-0.5 flex flex-col items-center select-none scale-90">
                          <div className="bg-[#00D632] w-4 h-4 rounded flex items-center justify-center text-white text-[9px] font-black mb-0.5">$</div>
                        </div>

                        <div className="border border-[#ccf7e1] bg-[#f9fbf9] rounded p-0.5 px-1 flex items-center justify-between scale-90">
                          <span className="text-gray-800 font-extrabold text-[7px]">Enter amount</span>
                        </div>
                        <div className="grid grid-cols-3 gap-0.5 scale-90">
                          {["$10", "$20", "$30"].map(v => (
                            <div key={v} className="py-0.5 border border-gray-250 bg-white rounded text-center text-[5px] font-bold">{v}</div>
                          ))}
                        </div>
                      </div>

                      <button type="button" className="w-full mt-1 py-1.5 bg-[#00D632] text-white font-extrabold rounded-lg text-[8px] scale-95">
                        Pay Now {"->"}
                      </button>
                    </div>
                  )}

                </div>
              </div>
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
                  <th className="py-4 px-6">Template</th>
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
                    <td className="py-4 px-6 text-gray-650 font-semibold whitespace-nowrap">
                      {link?.theme || "Cash Green"}
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

export default PosterDynamicLinkForm;
