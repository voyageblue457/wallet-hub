function AdminQR({ admin, selectedSite, setSelectedSite, fetchedData2 }) {
  const adminLinks =
    admin &&
    fetchedData2?.data?.posters.map((poster) => ({
      username: poster.username,
      links: poster.links,
    }));

  return (
    <div className="">
      {adminLinks?.map((admin, i) => (
        <div key={i} className="py-5">
          <p className=" text-custom-gray3 font-semibold">
            Poster: {admin.username}
          </p>
          {admin.links.map((site, i) => (
            <div key={i} className="py-2 flex items-center justify-between">
              <p className=" text-sm text-custom-gray3 font-semibold">
                {site.split("https://").join("")}
              </p>

              <div className="">
                <button
                  className={`text-xs font-bold text-white px-2 py-1 rounded ${
                    selectedSite === site ? "bg-blue-600" : "bg-cyan-700 "
                  }`}
                  onClick={() => setSelectedSite(site)}
                >
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default AdminQR;
