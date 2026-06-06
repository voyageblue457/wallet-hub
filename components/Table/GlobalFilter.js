import { useState } from "react";
import { useAsyncDebounce } from "react-table";
import "regenerator-runtime/runtime";

export const GlobalFilter = ({ filter, setFilter }) => {
  const [value, setValue] = useState(filter);

  const onChange = useAsyncDebounce((value) => {
    setFilter(value || undefined);
  }, 300);

  return (
    <div className="my-4 text-center">
      <span className="">
        Search
        <input
          type="text"
          className="ml-3 px-3 py-1 outline-none border border-slate-300 focus:border-gray-500 text-slate-800 bg-custom-gray rounded"
          value={value || ""}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value);
          }}
        />
      </span>
    </div>
  );
};
