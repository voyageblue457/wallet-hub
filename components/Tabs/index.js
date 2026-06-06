import { useState } from "react";

function Tabs({ tabsData }) {
  const [toggleState, setToggleState] = useState(0);

  return (
    <>
      <div className="flex">
        {tabsData.map((tab, i) => (
          <div key={i} className="relative bg-slate-100">
            {toggleState === i && (
              <div className="absolute rounded -top-1 left-0 right-0 border-t-4 border-indigo-600 "></div>
            )}
            <h4
              className={`text-xl font-semibold px-3 py-2 ${
                toggleState === i
                  ? "bg-white cursor-default"
                  : // : "bg-slate-100 opacity-50 cursor-pointer"
                    "cursor-pointer opacity-50"
              }`}
              onClick={() => setToggleState(i)}
            >
              {tab.label}
            </h4>
          </div>
        ))}
      </div>

      <div className="">
        <div className="pt-10">{tabsData[toggleState].content}</div>
      </div>
    </>
  );
}

export default Tabs;
