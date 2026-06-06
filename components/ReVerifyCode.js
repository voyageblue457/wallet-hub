"use client";
import React, { useState } from "react";
import { API_URL } from "../config/index";

function ReVerifyCode({ id }) {
  console.log(id);
  // const [code, setCode] = useState("");
  // console.log(code);
  // const [visible, setVisible] = useState(false);
  const handleReverify = async () => {
    console.log('hit');
    
    const values = {
      id,
      // code,
    };
    const url = `${API_URL}/reverify/code/page/post`;

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
      // setVisible(false);
      // setCode("");
    } else {
      console.log("error", data);
    }
  };
  return (
    <>
      <button
        onClick={() => handleReverify()}
        className="bg-cyan-600 text-xs text-white font-semibold px-2 py-1 rounded"
      >
        AccVerify
      </button>
      {/* {visible ? (
        <>
          <div class="fixed z-10 overflow-y-auto top-0 w-full left-0 ">
            <div class="flex items-center justify-center min-height-100vh pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div class="fixed inset-0 transition-opacity">
                <div class="absolute inset-0 bg-gray-900 opacity-75" />
              </div>
              <span class="hidden sm:inline-block sm:align-middle sm:h-screen">
                &#8203;
              </span>
              <div
                class="inline-block align-center bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <label class="font-medium text-gray-800">Code</label>
                  <input
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    type="text"
                    class="w-full outline-none rounded bg-gray-100 p-2 mt-2 mb-3"
                  />
                </div>
                <div class="bg-gray-200 px-4 py-3 text-right">
                  <button
                    type="button"
                    class="py-2 px-4 bg-gray-500 text-white rounded hover:bg-gray-700 mr-2"
                    onClick={() => setVisible(false)}
                  >
                    <i class="fas fa-times"></i>Cancel
                  </button>
                  <button
                    onClick={handleCode}
                    type="button"
                    class="py-2 px-4 bg-blue-500 text-white rounded font-medium hover:bg-blue-700 mr-2 transition duration-500"
                  >
                    <i class="fas fa-plus"></i>Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null} */}
    </>
  );
}

export default ReVerifyCode;
