import { useState, useMemo, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { FaLink, FaCopy, FaExternalLinkAlt, FaTrash, FaCheck, FaInfoCircle, FaRegEye, FaLock, FaArrowRight } from "react-icons/fa";
import { MdOutlineClose } from "react-icons/md";
import Loader from "../components/common/Loader";
import Table from "../components/Table";
import useGetData from "../hooks/useGetData";
import usePostData from "../hooks/usePostData";
import { toast } from "react-toastify";
import axios from "axios";
import { API_URL } from "../config";

const THEME_OPTIONS = [
  { name: "Cash Green", bg: "bg-[#00D632]", text: "text-white" },
  { name: "Payin Cash", bg: "bg-[#05b875]", text: "text-white" },
  { name: "Pay Cash App", bg: "bg-[#0f2e1b]", text: "text-white" },
  { name: "CashApp Dark", bg: "bg-[#121212] border border-[#22332a]", text: "text-[#00E676]" },
  { name: "CashApp Online", bg: "bg-gradient-to-tr from-[#f3faf6] to-[#e8f5ed] border border-emerald-100", text: "text-emerald-500" },
  { name: "Pay Isla", bg: "bg-gradient-to-br from-[#0c2a1a] to-[#020a06] border border-emerald-800/40", text: "text-emerald-300" }
];

const BRAND_OPTIONS = ["Cash App", "Cash Pay", "Lightning Pay"];

export default function PaymentLinksPage() {
  const { data: session } = useSession();
  const admin = session?.user?.admin;
  const superAdmin = session?.user?.superAdmin;
  const id = session?.user?.id;
  const dbUserId = session?.user?.id; // Main DB _id

  // Form states
  const [username, setUsername] = useState("");
  const [title, setTitle] = useState("");
  const [fixedAmount, setFixedAmount] = useState("Open");
  const [minAmount, setMinAmount] = useState(1);
  const [maxAmount, setMaxAmount] = useState(2000);
  const [brandName, setBrandName] = useState("Cash App");
  const [domain, setDomain] = useState("");
  const [createFor, setCreateFor] = useState("admin"); // 'admin' or reseller poster ID
  const [selectedTheme, setSelectedTheme] = useState("Cash Green");
  const [editingLinkId, setEditingLinkId] = useState(null);

  const isKeypadGreen = selectedTheme === "Cash Green" || selectedTheme === "CashApp Dark" || selectedTheme === "Pay Isla";

  // Modal states
  const [detailsLink, setDetailsLink] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch base links / domains
  const { data: baseDataRes, isLoading: baseLoading } = useGetData(
    id ? `/link/get/all/hello/world/com/data/${id}/${admin ? 1 : 0}` : null
  );
  
  const assignedDomains = useMemo(() => {
    const rawData = baseDataRes?.data?.data || [];
    // If it's admin, they might also get domains from sites
    const rawSites = baseDataRes?.data?.sites || [];
    const domainsList = rawSites.map(s => s.name || s).filter(Boolean);
    if (domainsList.length > 0) return domainsList;
    return rawData.map(d => typeof d === "string" ? d.split("https://").join("") : d).filter(Boolean);
  }, [baseDataRes]);

  // Set default domain once loaded
  useEffect(() => {
    if (assignedDomains.length > 0 && !domain) {
      setDomain(assignedDomains[0]);
    }
  }, [assignedDomains, domain]);

  // Fetch resellers/posters (Admin only)
  const { data: postersRes } = useGetData(
    admin && dbUserId ? `/all/poster/${dbUserId}` : null
  );
  const postersList = postersRes?.data?.data?.posters || [];

  // Fetch generated dynamic links
  const { data: dynamicLinksRes, isLoading: isNormalLinksLoading, refetch: refetchLinks } = useGetData(
    id ? `/dynamic-link/get/${id}` : null
  );

  const [superAdminLinks, setSuperAdminLinks] = useState([]);
  const [superAdminLinksLoading, setSuperAdminLinksLoading] = useState(false);

  const fetchSuperAdminLinks = useCallback(async () => {
    if (!superAdmin || !id) return;
    setSuperAdminLinksLoading(true);
    try {
      // 1. Fetch all admins
      const adminsRes = await axios.get(`${API_URL}/admin/list/${id}`);
      const admins = adminsRes?.data?.data || [];

      // 2. Fetch links for self
      const selfRes = await axios.get(`${API_URL}/dynamic-link/get/${id}`);
      let allLinks = selfRes?.data?.data || [];

      // 3. Fetch links for each admin
      const linkPromises = admins.map((adminUser) =>
        axios.get(`${API_URL}/dynamic-link/get/${adminUser._id}`).catch((err) => null)
      );
      const linkResponses = await Promise.all(linkPromises);

      linkResponses.forEach((res) => {
        if (res?.data?.data) {
          allLinks = [...allLinks, ...res.data.data];
        }
      });

      // Remove duplicates by _id
      const uniqueLinks = Array.from(
        new Map(allLinks.map((l) => [l._id, l])).values()
      );

      // Sort by createdAt desc
      uniqueLinks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setSuperAdminLinks(uniqueLinks);
    } catch (err) {
      console.error("Error fetching all links for super admin:", err);
    } finally {
      setSuperAdminLinksLoading(false);
    }
  }, [superAdmin, id]);

  useEffect(() => {
    if (superAdmin && id) {
      fetchSuperAdminLinks();
    }
  }, [superAdmin, id, dynamicLinksRes, fetchSuperAdminLinks]);

  const dynamicLinks = superAdmin ? superAdminLinks : (dynamicLinksRes?.data?.data || []);
  const linksLoading = isNormalLinksLoading || (superAdmin ? superAdminLinksLoading : false);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = dynamicLinks.length;
    const active = dynamicLinks.length; // all are active by default
    let clicks = 0;
    let invoices = 0;
    dynamicLinks.forEach(link => {
      clicks += link.clicks || 0;
      invoices += link.invoices || 0;
    });
    return { total, active, clicks, invoices };
  }, [dynamicLinks]);

  // Post dynamic link hook
  const { mutate: addLink, isLoading: isSaving } = usePostData({
    path: "/link/add",
  });

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast.error("Username is required");
      return;
    }
    if (!domain) {
      toast.error("Domain is required");
      return;
    }

    // Sanitize path (no spaces, lowercase)
    const sanitizedPath = username.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-_]/g, "");
    const fullLinkName = `https://${domain}/${sanitizedPath}`;

    // Determine root
    let rootValue = id;
    if (admin) {
      if (createFor !== "admin") {
        rootValue = createFor; // This is the poster's _id
      }
    }

    const payload = {
      linkName: fullLinkName,
      targetUrl: "",
      root: rootValue,
      theme: selectedTheme,
      fixedAmount: fixedAmount.toString(),
      minAmount: Number(minAmount),
      maxAmount: Number(maxAmount),
      username: username.trim(),
      title: title.trim(),
      brandName,
      domain
    };

    addLink(payload, {
      onSuccess: () => {
        toast.success(editingLinkId ? "Payment Link updated successfully!" : "Payment Link generated successfully!");
        setUsername("");
        setTitle("");
        setFixedAmount("Open");
        setMinAmount(1);
        setMaxAmount(2000);
        setEditingLinkId(null);
        refetchLinks();
      },
      onError: () => {
        toast.error("Failed to generate payment link.");
      }
    });
  };

  const handleCopy = (txt) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied to clipboard!");
  };

  const handleEdit = (link) => {
    setEditingLinkId(link._id);
    // Extract path/username from linkName
    const parts = link.linkName.split("/");
    const pathVal = parts[parts.length - 1] || "";
    setUsername(link.username || pathVal);
    setTitle(link.title || "");
    setFixedAmount(link.fixedAmount || "Open");
    setMinAmount(link.minAmount || 1);
    setMaxAmount(link.maxAmount || 2000);
    setBrandName(link.brandName || "Cash App");
    setDomain(link.domain || "");
    setSelectedTheme(link.theme || "Cash Green");
    if (link.root) {
      // Find matching reseller
      const matchingReseller = postersList.find(p => p._id === link.root);
      if (matchingReseller) {
        setCreateFor(matchingReseller._id);
      } else {
        setCreateFor("admin");
      }
    } else {
      setCreateFor("admin");
    }
  };

  const handleDelete = async (linkId) => {
    if (window.confirm("Are you sure you want to delete this payment link?")) {
      try {
        await axios.delete(`${API_URL}/dynamic-link/delete/${linkId}`);
        toast.success("Payment link deleted successfully");
        refetchLinks();
      } catch (err) {
        toast.error("Failed to delete payment link");
      }
    }
  };

  // Columns for dynamic link table
  const columns = useMemo(() => {
    const tableCols = [
      {
        Header: "Link",
        accessor: "linkName",
        width: "auto",
        Cell: ({ value }) => (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded truncate max-w-[200px]" title={value}>
              {value}
            </span>
            <button
              onClick={() => handleCopy(value)}
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition cursor-pointer"
              title="Copy URL"
            >
              <FaCopy className="w-3 h-3" />
            </button>
            <a
              href={value.startsWith("http") ? value : `https://${value}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 bg-gray-100 hover:bg-gray-200 text-green-600 rounded transition"
              title="Open link"
            >
              <FaExternalLinkAlt className="w-3 h-3" />
            </a>
          </div>
        )
      },
      ...(admin ? [
        {
          Header: "Owner",
          accessor: (row) => row.owner?.name || "Main account",
          id: "owner",
          Cell: ({ row }) => {
            const type = row.original.owner?.type || "Reseller";
            const isUser = type === "User";
            const email = row.original.owner?.email;
            return (
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isUser ? "bg-cyan-100 text-cyan-800" : "bg-blue-100 text-blue-800"
                  }`}>
                    {type}
                  </span>
                  <span className="font-semibold text-gray-800 text-sm">{row.original.owner?.name || "Admin"}</span>
                </div>
                {email && <span className="text-xs text-gray-400">{email}</span>}
              </div>
            );
          }
        }
      ] : []),
      {
        Header: "Domain",
        accessor: "domain",
        Cell: ({ value }) => <span className="text-gray-500 font-medium text-xs">{value}</span>
      },
      {
        Header: "Theme",
        accessor: "theme",
        Cell: ({ value }) => (
          <span className="px-2 py-1 bg-gray-100 border border-gray-200 text-gray-600 text-xs font-semibold rounded-full">
            {value}
          </span>
        )
      },
      {
        Header: "Amount",
        accessor: "fixedAmount",
        Cell: ({ row, value }) => {
          const isFixed = value && value !== "Open";
          return (
            <div className="flex flex-col">
              <span className={`text-xs font-bold ${isFixed ? "text-indigo-600" : "text-gray-500"}`}>
                {isFixed ? `$${parseFloat(value).toFixed(2)}` : "Open amount"}
              </span>
              {!isFixed && (
                <span className="text-[10px] text-gray-400">
                  ${row.original.minAmount || 1} - ${row.original.maxAmount || 2000}
                </span>
              )}
            </div>
          );
        }
      },
      {
        Header: "Clicks",
        accessor: "clicks",
        Cell: ({ value }) => <span className="font-bold text-gray-700">{value || 0}</span>
      },
      {
        Header: "Invoices",
        accessor: "invoices",
        Cell: ({ value }) => <span className="font-bold text-gray-700">{value || 0}</span>
      },
      {
        Header: "Status",
        accessor: () => "active",
        id: "status",
        Cell: () => (
          <span className="px-2 py-0.5 bg-green-100 text-green-800 border border-green-200 text-[10px] font-bold uppercase rounded-full">
            active
          </span>
        )
      },
      {
        Header: "Action",
        accessor: "_id",
        Cell: ({ row }) => (
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setDetailsLink(row.original);
                setIsDetailsOpen(true);
              }}
              className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded shadow-sm hover:shadow transition animate-none cursor-pointer"
              title="Details"
            >
              Details
            </button>
            <button
              onClick={() => handleEdit(row.original)}
              className="px-2 py-1 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 border border-yellow-200 text-xs font-bold rounded cursor-pointer"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(row.original._id)}
              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold rounded cursor-pointer"
            >
              Delete
            </button>
          </div>
        )
      }
    ];
    return tableCols;
  }, [postersList, admin]);

  return (
    <div className="pb-16 text-gray-800 font-sans">
      
      {/* Page Title & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="text-[28px] text-custom-blue2">
            <FaLink />
          </span>
          <h1 className="text-2xl font-bold text-custom-gray2">Payment Links</h1>
        </div>
        <div className="text-xs text-gray-400 font-semibold">
          <span>Home</span> <span className="mx-1">/</span> <span className="text-gray-500">Payment Links</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total Links</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{summaryMetrics.total}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg text-lg"><FaLink /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Active</p>
            <p className="text-2xl font-black text-green-600 mt-1">{summaryMetrics.active}</p>
          </div>
          <div className="p-3 bg-green-50 text-green-600 rounded-lg text-lg"><FaCheck /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Clicks</p>
            <p className="text-2xl font-black text-amber-500 mt-1">{summaryMetrics.clicks}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-500 rounded-lg text-lg"><FaExternalLinkAlt /></div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Invoices</p>
            <p className="text-2xl font-black text-cyan-600 mt-1">{summaryMetrics.invoices}</p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-600 rounded-lg text-lg"><FaInfoCircle /></div>
        </div>
      </div>

      {/* Generate & Theme Container */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-150/60 mb-8 max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full"></span>
            {editingLinkId ? "Edit Payment Link" : "Generate New Payment Link"}
          </h2>
          {editingLinkId && (
            <button
              onClick={() => {
                setEditingLinkId(null);
                setUsername("");
                setTitle("");
                setFixedAmount("Open");
              }}
              className="text-xs text-red-500 font-bold hover:underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Username/Path Input */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Username (Path) *</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. shop1, love24"
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Title Input */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Title (Reason for Payment)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Pay for my clothing brand"
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>

            {/* Fixed Amount */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Fixed Amount (USD) *</label>
              <input
                type="text"
                required
                value={fixedAmount}
                onChange={(e) => setFixedAmount(e.target.value)}
                placeholder="e.g. Open, 50, 100"
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition"
              />
              <p className="text-[10px] text-gray-400 mt-0.5">Type "Open" for variable payment or enter a number</p>
            </div>

            {/* Domain Select */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Domain *</label>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer text-gray-700"
              >
                <option value="" disabled>Select domain</option>
                {assignedDomains.map((d, idx) => (
                  <option key={idx} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Min Amount */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Min Amount (if Open)</label>
              <input
                type="number"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                disabled={fixedAmount !== "Open"}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition disabled:opacity-50"
                min="1"
              />
            </div>

            {/* Max Amount */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Max Amount (if Open)</label>
              <input
                type="number"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                disabled={fixedAmount !== "Open"}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition disabled:opacity-50"
                min="1"
              />
            </div>

            {/* Brand Name Select */}
            <div className="flex flex-col">
              <label className="text-xs font-semibold text-gray-600 mb-1">Brand Name *</label>
              <select
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer text-gray-700"
              >
                {BRAND_OPTIONS.map((b, idx) => (
                  <option key={idx} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Create For (Admin Only) */}
            {admin && (
              <div className="flex flex-col">
                <label className="text-xs font-semibold text-gray-600 mb-1">Create For (Owner) *</label>
                <select
                  value={createFor}
                  onChange={(e) => setCreateFor(e.target.value)}
                  className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:bg-white transition cursor-pointer text-gray-700"
                >
                  <option value="admin">Admin Account (Self)</option>
                  {postersList.map((p) => (
                    <option key={p._id} value={p._id}>{p.username} (Reseller)</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Payment Page Theme Selector */}
          <div className="pt-2">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-3">
              Payment Page Theme
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {THEME_OPTIONS.map((theme) => {
                const isSelected = selectedTheme === theme.name;
                return (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setSelectedTheme(theme.name)}
                    className={`p-3 rounded-xl border flex flex-col items-center justify-between h-[84px] transition active:scale-98 text-center cursor-pointer ${
                      isSelected
                        ? "border-blue-500 bg-blue-50/50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className={`w-8 h-4 rounded-md ${theme.bg}`}></div>
                    <span className="text-xs font-bold text-gray-700">{theme.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Integrated Live Preview Section */}
          <div className="pt-6 border-t border-gray-150">
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-4 text-center md:text-left">
              Theme Live Preview
            </label>
            <div className="bg-slate-50 border border-gray-150 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-6 items-center justify-center">
              <div className="flex-1 space-y-2 text-center md:text-left">
                <h4 className="text-sm font-bold text-gray-800">{selectedTheme} Layout</h4>
                <p className="text-xs text-gray-500 leading-relaxed">
                  This interactive screen shows how your custom payment link appears to customers. Brand names, user details, custom preset amounts, and colors will dynamically reflect your theme choice.
                </p>
                <div className="pt-2 flex justify-center md:justify-start">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs font-semibold rounded-full">
                    <FaCheck className="w-3.5 h-3.5" /> Secure Live Preview
                  </span>
                </div>
              </div>

              {/* Interactive Mobile Mockup */}
              <div className="bg-slate-100 rounded-3xl p-4 flex items-center justify-center shadow-inner border border-gray-205 shrink-0">
                <div className="w-[240px] h-[370px] bg-white rounded-[32px] shadow-2xl border-4 border-slate-800 relative overflow-hidden flex flex-col justify-between text-left select-none">
                  
                  {/* Speaker Notch */}
                  <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-slate-800 rounded-full z-20"></div>

                  {isKeypadGreen && (
                    <div className="h-full w-full bg-[#00D632] text-white flex flex-col justify-between p-3 text-[8px]">
                      {/* Mock Header */}
                      <div className="flex justify-between items-center mt-1">
                        <div className="bg-white text-[#00D632] rounded-md font-bold px-1 py-0.5 scale-90">C</div>
                        <div className="flex flex-col items-center">
                          <span className="font-extrabold text-[9px] mb-0.5">
                            {selectedTheme === "CashApp Dark" ? `Pay $${username || "theme-preview-cashapp-dark"}` :
                             selectedTheme === "Pay Isla" ? `Pay ${brandName || "Isla"}` : "Cash Green"}
                          </span>
                          <span className="bg-[#00b029] px-1.5 py-0.5 rounded-full text-[6px] border border-white/15 scale-90 flex items-center gap-0.5">
                            <FaCheck className="text-[5px]" /> Secure Payment
                          </span>
                        </div>
                        <div className="w-4"></div>
                      </div>

                      {/* Subtitle card */}
                      <div className="bg-white/10 border border-white/15 rounded-2xl p-1.5 flex flex-col items-center text-center mt-2">
                        <div className="w-5 h-5 bg-white text-[#00D632] rounded-lg flex items-center justify-center font-black text-xs mb-0.5">$</div>
                        <span className="font-bold text-[8px] truncate max-w-[120px]">{selectedTheme === "CashApp Dark" ? "Cashapp" : brandName}</span>
                        <span className="text-[6px] text-white/70 flex items-center gap-0.5 mt-0.5">
                          <span className="w-1 h-1 bg-emerald-400 rounded-full inline-block"></span> Instant
                        </span>
                      </div>

                      {/* Big amount */}
                      <div className="text-center my-1.5">
                        <h2 className="text-3xl font-black">${fixedAmount !== "Open" ? fixedAmount : "0"}</h2>
                        <p className="text-[6px] font-bold tracking-wider text-white/70 uppercase">
                          {selectedTheme === "Cash Green" ? "United States Dollar" : "USD"}
                        </p>
                      </div>

                      {/* Keypad Grid Mock */}
                      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[180px] mx-auto my-1">
                        {["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "<-"].map((k) => (
                          <div key={k} className="h-6 rounded bg-white/10 border border-white/5 flex items-center justify-center text-[8px] font-bold">
                            {k}
                          </div>
                        ))}
                      </div>

                      {/* Pay button */}
                      <button type="button" className="w-full py-2 bg-[#009c24] text-white font-extrabold rounded-xl text-[9px] transition active:scale-95 shadow">
                        Pay
                      </button>
                      <p className="text-center text-[5px] text-white/50 tracking-widest mt-1">Powered by {brandName}</p>
                    </div>
                  )}

                  {selectedTheme === "Payin Cash" && (
                    <div className="h-full w-full bg-slate-50 text-gray-800 flex flex-col justify-between p-3 text-[8px]">
                      {/* Mock Header */}
                      <div className="flex justify-between items-center mt-1 border-b border-gray-100 pb-1.5">
                        <div className="w-5 h-5 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-[9px]">C</div>
                        <div className="border border-gray-200 px-2 py-0.5 bg-white text-gray-550 rounded-full scale-75 transform origin-right">Secure</div>
                      </div>

                      {/* Card content */}
                      <div className="bg-white border border-gray-100 rounded-2xl p-2.5 flex-1 flex flex-col justify-between mt-2.5 shadow-sm">
                        <div className="text-center">
                          <div className="w-7 h-7 bg-[#00D632] rounded-full mx-auto flex items-center justify-center text-white font-bold text-xs mb-1">C</div>
                          <p className="font-extrabold text-[9px]">Payin Cash</p>
                          <div className="inline-flex items-center gap-0.5 bg-emerald-50 text-[#05b875] px-2 py-0.5 rounded-full text-[6px] border border-emerald-100 mt-1">
                            <FaCheck className="text-[5px]" /> Secure Payment
                          </div>
                        </div>

                        <div className="border border-gray-100 rounded-xl p-2 text-center text-gray-400 font-medium text-[8px]">
                          Enter amount
                        </div>

                        <div className="space-y-1 mt-1">
                          <span className="text-[6px] text-gray-400 font-bold block">SELECT AMOUNT</span>
                          <div className="grid grid-cols-3 gap-1">
                            {["$10.00", "$50.00", "$100.00", "$200.00", "$300.00", "$500.00"].map(v => (
                              <div key={v} className="py-1 border border-gray-250 bg-white rounded text-center text-[7px] font-bold">{v}</div>
                            ))}
                          </div>
                          <div className="py-1 text-center bg-emerald-50 text-[#05b875] rounded text-[7px] border border-emerald-100/40">Show more amounts</div>
                        </div>
                      </div>

                      {/* Pay button */}
                      <button type="button" className="w-full mt-2.5 py-2 bg-[#05b875] text-white font-extrabold rounded-xl text-[9px] flex items-center justify-center gap-1">
                        <FaLock className="text-[6px]" /> Pay Now <FaArrowRight className="text-[6px]" />
                      </button>
                    </div>
                  )}

                  {selectedTheme === "Pay Cash App" && (
                    <div className="h-full w-full bg-white text-gray-800 flex flex-col justify-between p-3 text-[8px]">
                      {/* Mock Header */}
                      <div className="flex justify-between items-center mt-1 border-b border-gray-150 pb-1.5">
                        <div className="bg-[#00D632] w-5 h-5 rounded flex items-center justify-center text-white text-[11px] font-black font-sans">$</div>
                        <div className="border border-gray-200 px-2 py-0.5 bg-white text-gray-550 rounded-full scale-75 transform origin-right">Secure</div>
                      </div>

                      {/* Subheader info */}
                      <div className="text-center mt-1.5 flex flex-col items-center">
                        <div className="w-7 h-7 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-xs mb-1">C</div>
                        <span className="font-extrabold text-[8px]">@{username || "theme-preview"}</span>
                        <span className="text-[5px] text-gray-400 max-w-[150px] leading-tight block mt-0.5">Do not send Cash App to this name. Tap Pay now below to pay.</span>
                      </div>

                      {/* Card box */}
                      <div className="bg-white border border-gray-100 shadow-sm rounded-xl p-2.5 mt-2 flex-1 flex flex-col justify-between">
                        {/* step */}
                        <div className="flex justify-between items-center bg-gray-50 border border-gray-100 rounded-full p-0.5 scale-90">
                          <div className="flex items-center gap-0.5 bg-white border border-gray-100 px-2 py-0.5 rounded-full font-bold text-[6px]">
                            <span className="w-2.5 h-2.5 bg-[#00D632] text-white rounded-full flex items-center justify-center text-[5px]">1</span> Amount
                          </div>
                          <div className="flex items-center gap-0.5 px-2 font-bold text-[6px] text-gray-550">
                            <span className="w-2.5 h-2.5 bg-gray-200 text-gray-550 rounded-full flex items-center justify-center text-[5px]">2</span> Pay
                          </div>
                        </div>

                        {/* Instant logo */}
                        <div className="border border-gray-100 rounded-lg py-1.5 flex flex-col items-center select-none scale-90">
                          <div className="bg-[#00D632] w-5 h-5 rounded flex items-center justify-center text-white text-xs font-black mb-0.5">$</div>
                          <span className="font-bold text-[6px] text-gray-800">Instant</span>
                        </div>

                        {/* Input */}
                        <div className="space-y-1">
                          <div className="border border-gray-100 bg-slate-50 rounded-lg p-1 px-2 flex items-center gap-1.5 scale-95">
                            <span className="text-emerald-500 font-bold text-[9px]">$</span>
                            <span className="text-gray-800 font-extrabold text-[9px]">{fixedAmount !== "Open" ? fixedAmount : "0.00"}</span>
                          </div>
                          <span className="text-[6px] text-gray-400 block px-1">Between {minAmount} and {maxAmount} USD.</span>
                        </div>

                        {/* Quick amounts */}
                        <div className="flex gap-1 justify-center scale-95 mt-1">
                          {["$10", "$15", "$20", "$25"].map(v => (
                            <div key={v} className="px-1.5 py-0.5 border border-gray-250 bg-white text-gray-550 rounded-full text-[6px] font-bold">{v}</div>
                          ))}
                        </div>
                      </div>

                      {/* Pay button */}
                      <button type="button" className="w-full mt-2.5 py-2 bg-[#0f172a] text-white font-extrabold rounded-xl text-[9px] flex items-center justify-center gap-1 active:scale-95 shadow">
                        <span>Continue to payment</span> <FaArrowRight className="text-[6px]" />
                      </button>
                    </div>
                  )}

                  {selectedTheme === "CashApp Online" && (
                    <div className="h-full w-full bg-[#f4f6f8] text-gray-850 flex flex-col justify-between p-3 text-[8px]">
                      {/* Mock Header */}
                      <div className="flex justify-between items-center mt-1 pb-1.5">
                        <div className="w-5 h-5 bg-[#00D632] rounded-full flex items-center justify-center text-white font-bold text-[9px]">C</div>
                        <div className="border border-gray-200 px-2 py-0.5 bg-white text-gray-500 rounded-full scale-75 transform origin-right">Secure</div>
                      </div>

                      {/* Card content */}
                      <div className="bg-white border border-gray-100 rounded-[20px] p-2 flex-1 flex flex-col justify-between mt-1 shadow-sm">
                        <div className="text-center">
                          <p className="font-extrabold text-[8px]">Pay {brandName}</p>
                          <div className="inline-flex items-center gap-0.5 bg-[#ccf7e1] text-[#00b0ff] px-2 py-0.5 rounded-full text-[5px] border border-emerald-100 mt-1 scale-90">
                            Secure Payment
                          </div>
                        </div>

                        {/* Inner logo card */}
                        <div className="border border-gray-100 rounded-lg py-1 flex flex-col items-center select-none scale-90">
                          <div className="bg-[#00D632] w-5 h-5 rounded flex items-center justify-center text-white text-xs font-black mb-0.5">$</div>
                          <span className="font-bold text-[6px] text-gray-850">{brandName}</span>
                        </div>

                        <div className="space-y-1">
                          <div className="border border-[#ccf7e1] bg-[#f9fbf9] rounded-lg p-1 px-2 flex items-center justify-between scale-95">
                            <span className="text-[#00D632] font-black text-[7px]">$</span>
                            <span className="text-gray-800 font-extrabold text-[8px]">{fixedAmount !== "Open" ? fixedAmount : "Enter amount"}</span>
                          </div>
                          <span className="text-[5px] text-[#00D632] font-bold block uppercase tracking-wider scale-95">$ QUICK SELECT</span>
                          <div className="grid grid-cols-3 gap-1 scale-95">
                            {["$10.00", "$20.00", "$30.00"].map(v => (
                              <div key={v} className="py-0.5 border border-gray-250 bg-white rounded text-center text-[6px] font-bold">{v}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button type="button" className="w-full mt-2 py-1.5 bg-[#00D632] text-white font-extrabold rounded-lg text-[9px] flex items-center justify-center gap-1 active:scale-95 shadow">
                        Pay Now {"->"}
                      </button>
                    </div>
                  )}

                  {/* FALLBACK FOR OTHER PRESETS (Dark, Online, Isla) */}
                  {selectedTheme !== "Cash Green" && selectedTheme !== "Payin Cash" && selectedTheme !== "Pay Cash App" && (
                    <div className={`h-full w-full flex flex-col justify-between p-3.5 text-[10px] ${
                      selectedTheme === "CashApp Dark" ? "bg-[#0c0f0d] text-white" :
                      selectedTheme === "CashApp Online" ? "bg-gradient-to-tr from-[#f3faf6] to-[#e8f5ed] text-gray-850" :
                      "bg-gradient-to-br from-[#0c2a1a] to-[#020a06] text-emerald-100"
                    }`}>
                      
                      {/* Mock Header */}
                      <div className="flex justify-between items-center mb-2">
                        <div className={`p-1 rounded-md ${
                          selectedTheme.includes("Dark") || selectedTheme.includes("Isla") ? "bg-[#00E676] text-black" : "bg-[#00D632] text-white"
                        }`}>
                          $
                        </div>
                        <div className="px-2 py-0.5 rounded-full border border-gray-300 scale-75 transform origin-right">Secure</div>
                      </div>

                      {/* Mock Card Content */}
                      <div className={`p-2.5 rounded-2xl flex-1 flex flex-col justify-between border ${
                        selectedTheme === "CashApp Dark" ? "bg-[#141916] border-[#22332a]" :
                        selectedTheme === "Pay Isla" ? "bg-emerald-950/40 border-emerald-800/30" :
                        "bg-white border-gray-105 shadow-sm"
                      }`}>
                        <div className="text-center">
                          <div className={`w-8 h-8 rounded-full mx-auto flex items-center justify-center font-bold text-white mb-1 ${
                            selectedTheme === "Payin Cash" ? "bg-[#05b875]" : "bg-[#00D632]"
                          }`}>
                            c
                          </div>
                          <p className="font-extrabold text-[10px] truncate">{brandName}</p>
                          <p className="text-[8px] text-gray-400 truncate">{username || "your-shop"}</p>
                        </div>

                        <div className="border-t border-gray-100 my-1 opacity-40"></div>

                        <div className="space-y-1.5 flex-1 flex flex-col justify-end">
                          <p className="text-[8px] text-gray-400 font-bold uppercase tracking-wider text-center">Amount Selection</p>
                          
                          {/* Mock Grid */}
                          <div className="grid grid-cols-3 gap-1">
                            {[10, 50, 100].map(val => (
                              <div key={val} className="py-1 rounded text-center border font-bold text-[8px] border-gray-200">
                                ${val}
                              </div>
                            ))}
                          </div>

                          <div className="text-center font-mono font-bold text-[9px] text-gray-405 mt-1">
                            {fixedAmount === "Open" ? "Variable amount" : `$${fixedAmount}`}
                          </div>

                          <button
                            type="button"
                            className={`w-full py-1.5 rounded-full font-black text-center text-[9px] uppercase tracking-wider mt-1.5 ${
                              selectedTheme === "CashApp Dark" ? "bg-[#00E676] text-black" :
                              selectedTheme === "Payin Cash" ? "bg-[#05b875] text-white" :
                              selectedTheme === "Pay Isla" ? "bg-gradient-to-r from-[#00E676] to-[#00B0FF] text-black" :
                              "bg-[#00D632] text-white"
                            }`}
                          >
                            Pay Now
                          </button>
                        </div>
                      </div>

                      <p className="text-center text-[7px] text-gray-400 uppercase tracking-widest mt-2">Powered by {brandName}</p>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              <FaLink />
              <span>{editingLinkId ? "Update Link" : "Generate Link"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Generated Link List */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-gray-150/60 w-full overflow-hidden">
        <div className="border-b border-gray-100 pb-4 mb-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-green-500 rounded-full"></span>
            Generated Link List
          </h2>
          <p className="text-xs text-gray-400 mt-0.5 font-medium">All generated custom payment links and templates</p>
        </div>

        <Loader isLoading={linksLoading || baseLoading}>
          {dynamicLinks.length > 0 ? (
            <Table columnsHeading={columns} usersData={dynamicLinks} />
          ) : (
            <div className="text-center py-12 text-gray-400 font-semibold">
              <FaLink className="text-4xl text-gray-200 mx-auto mb-3" />
              <p>No payment links created yet</p>
              <p className="text-xs text-gray-400 font-normal mt-1">Use the generator form above to create your first link.</p>
            </div>
          )}
        </Loader>
      </div>

      {/* Details Modal */}
      {isDetailsOpen && detailsLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden relative border border-gray-150 p-6 flex flex-col">
            <button
              onClick={() => setIsDetailsOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-full transition"
            >
              <MdOutlineClose className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-extrabold text-gray-900 mb-4 flex items-center gap-2 border-b border-gray-100 pb-2">
              <FaLink className="text-blue-500" />
              <span>Link Configuration Details</span>
            </h3>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-start border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Full URL:</span>
                <span className="font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded break-all max-w-[240px] text-right select-all">
                  {detailsLink.linkName}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Brand Name:</span>
                <span className="font-bold text-gray-800">{detailsLink.brandName || "Cash App"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Shop Username:</span>
                <span className="font-bold text-gray-800">{detailsLink.username || "N/A"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Title:</span>
                <span className="text-gray-700 italic text-right max-w-[200px] truncate">{detailsLink.title || "No title set"}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Domain:</span>
                <span className="font-mono text-gray-600 text-xs">{detailsLink.domain}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Selected Theme:</span>
                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full">{detailsLink.theme}</span>
              </div>
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Fixed Amount:</span>
                <span className="font-black text-emerald-600">
                  {detailsLink.fixedAmount === "Open" ? "Variable (Open)" : `$${parseFloat(detailsLink.fixedAmount).toFixed(2)}`}
                </span>
              </div>
              {detailsLink.fixedAmount === "Open" && (
                <div className="flex justify-between border-b border-gray-50 pb-2">
                  <span className="font-semibold text-gray-500">Amount Limits:</span>
                  <span className="text-gray-700 font-bold">${detailsLink.minAmount || 1} - ${detailsLink.maxAmount || 2000}</span>
                </div>
              )}
              <div className="flex justify-between border-b border-gray-50 pb-2">
                <span className="font-semibold text-gray-500">Clicks Logged:</span>
                <span className="font-bold text-gray-800">{detailsLink.clicks || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-gray-500">Invoices Generated:</span>
                <span className="font-bold text-gray-800">{detailsLink.invoices || 0}</span>
              </div>
            </div>

            <button
              onClick={() => setIsDetailsOpen(false)}
              className="mt-6 w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
