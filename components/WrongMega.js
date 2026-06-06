import React from "react";
import { API_URL } from "../config/index";

function WrongMega({ id }) {
  console.log(id);
  
  const handleWrongPass = async () => {
    const values = {
      id,
    };
    const url = `${API_URL}/password/mega/wrong`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(values),
    });
    const data = await res.json();
    if (res.ok) {
      console.log("success", data);
    } else {
      console.log("error", data);
    }
  };

  return (
    <button
      onClick={handleWrongPass}
      className="bg-red-600 text-xs text-white font-semibold px-2 py-1 rounded"
    >

        WrongMega
    </button>
  );
}

export default WrongMega;
