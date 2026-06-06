function PosterQR({ selectedSite, setSelectedSite, fetchedData2 }) {
  const posterLinks = fetchedData2?.data;
   console.log(posterLinks)

  return (
    <div className="">
      {posterLinks?.map((site, i) => (
        <div key={i} className="flex items-center justify-between">
          <p className="py-3 text-sm text-custom-gray3 font-semibold">
            {site.split("https://").join("")}
          </p>

          <div className="">
            <button
              className={`text-xs font-bold text-white px-2 py-1 rounded ${
                selectedSite === site ? "bg-blue-500" : "bg-cyan-700 "
              }`}
              onClick={() => setSelectedSite(site)}
            >
              Generate
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default PosterQR;
