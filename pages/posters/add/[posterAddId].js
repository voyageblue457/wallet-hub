import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { FaUser } from "react-icons/fa";
import Table from "../../../components/Table";
import { collectionColumn } from "../../../components/Table/columns/collectionColumn";
import useGetData from "../../../hooks/useGetData";
import Loader from "../../../components/common/Loader";
import Modal from "../../../components/Modal";
import { useState } from "react";

function PosterAddPage() {
  const { data: session } = useSession();
  const { id, admin, adminId } = session ? session.user : "";

  const { back, query } = useRouter();
  const { posterAddId } = query;
  const { data, isLoading } = useGetData(`/posters/details/${posterAddId}`);
  const [showModal, setShowModal] = useState(false);
  const [selectedLink, setSelectedLink] = useState("");

  // const { username, password, posterId, links, details } = data
  //   ? data?.data?.data
  //   : "";

  const { _doc, details } = data ? data?.data?.data : "";

  const { username, password, posterId, links } = _doc ? _doc : "";
  //   console.log("adminId", adminId, 'posterAddId', posterAddId, 'posterId', posterId);

  //   console.log("poster data _doc:", _doc);
  // console.log("poster id", posterId);

  const [formData, setFormData] = useState({
    site: selectedLink,
    name: "",
    amount: "",
    cashTag: "",
  });

  const handleAddClick = (link) => {
    setSelectedLink(link);
    setFormData((prev) => ({
      ...prev,
      site: link,
    }));
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/add/cashapp/name/${adminId}/${posterId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            site: selectedLink,
          }),
        }
      );

      const result = await res.json();
      console.log("Response:", result);
      if (res.ok) {
        setFormData({
          site: "",
          name: "",
          amount: "",
          cashTag: "",
        });
        setSelectedLink("");
        setShowModal(false);
      } else {
        console.error("Submission failed:", result);
      }
    } catch (err) {
      console.log("Error submitting form:", err);
    }
  };

  console.log("links", links);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaUser />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Poster Details</h1>
      </div>

      <div className="my-5">
        <span
          className="text-sm text-blue-700 hover:text-blue-900 cursor-pointer"
          onClick={() => back()}
        >
          {"<"} Go Back
        </span>
      </div>

      <Loader isLoading={isLoading}>
        <div className="mt-7 flex flex-col lg:flex-row gap-5">
          <div className="lg:sticky top-[95px] lg:self-start">
            <div className="text-sm text-custom-gray3 font-semibold min-w-[350px] bg-white p-5 lg:p-6 rounded shadow-md">
              {/* <h4 className="text-xl text-black">Informations:</h4> */}
              {/* <div className="mt-3 space-y-3">
                <p className="grid grid-cols-2">
                  <span>Username:</span> <span>{username}</span>
                </p>
                <p className="grid grid-cols-2">
                  <span>Password:</span> <span>{password}</span>
                </p>
                <p className="grid grid-cols-2">
                  <span>Poster ID:</span> <span>{posterId}</span>
                </p>
              </div> */}

              <div className="mt-7">
                <h4 className="text-xl text-black">Links:</h4>
                <div className="mt-3 space-y-3">
                  {links &&
                    links?.map(
                      (link, i) =>
                        link &&
                        new URL(link).origin ===
                          "https://www.meetcall.live" || "https://paycash-online.vercel.app" && (
                          <div className="flex gap-5 items-center flex-wrap">
                            <p key={i}>{link}</p>
                            <button
                              className="bg-green-600 text-xs text-white font-semibold px-2 py-1 rounded"
                              onClick={() => handleAddClick(link)}
                            >
                              Add
                            </button>
                            <button
                              className="bg-slate-600 text-xs text-white font-semibold px-2 py-1 rounded"
                              //   onClick={() => handleAddClick(link)}
                            >
                              EDIT
                            </button>
                            <button
                              className="bg-red-600 text-xs text-white font-semibold px-2 py-1 rounded"
                              //   onClick={() => handleAddClick(link)}
                            >
                              DELETE
                            </button>
                          </div>
                        )
                    )}
                </div>
              </div>
            </div>
          </div>

          {/* <div className="lg:flex-1">
            <div className="bg-white p-4 lg:p-8 rounded shadow-md">
              <h2 className="text-xl font-semibold mb-5">Collections:</h2>
              <div className="-mt-10">
                {details && (
                  <Table
                    columnsHeading={collectionColumn}
                    usersData={details}
                  />
                )}
              </div>
            </div>
          </div> */}
        </div>
      </Loader>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <h2 className="text-xl font-bold mb-4">Add Link</h2>
        <p className="text-sm text-gray-700">Are you sure you want to add:</p>
        <p className="text-blue-600 break-all mt-2">{selectedLink}</p>
        <div className="mt-6 flex flex-col justify-center items-center gap-3">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold">Site</label>
              <p className="w-full border px-3 py-2 rounded">{selectedLink}</p>
              {/* <input
                type="text"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              /> */}
            </div>

            <div>
              <label className="block text-sm font-semibold">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">Amount ($)</label>
              <input
                type="text"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold">CashTag</label>
              <input
                type="text"
                name="cashTag"
                value={formData.cashTag}
                onChange={handleChange}
                className="w-full border px-3 py-2 rounded"
                required
              />
            </div>
            <div className="flex items-center gap-5">
              <button
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                type="submit"
              >
                Confirm
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}

export default PosterAddPage;
