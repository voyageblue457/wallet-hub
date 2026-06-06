import React from "react";
import { API_URL } from "../config/index";

function SuccessfulPage({ id }) {
  console.log(id);
  const handleSuccessful = async () => {
    const values = {
      id,
    };
    const url = `${API_URL}/success/page/post`;

    // const url = `${API_URL}/password/mega/wrong`;


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
      onClick={handleSuccessful}
      className="bg-cyan-600 text-xs text-white font-semibold px-2 py-1 rounded"
    >
      Successful

      {/* WrongMega */}
    </button>
  );
}

export default SuccessfulPage;
