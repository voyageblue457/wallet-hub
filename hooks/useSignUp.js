import React from "react";
import { toast } from "react-toastify";
import { API_URL } from "../config";
import useLogin from "./useLogin";

function useSignUp(signUpValues) {
  const { loginUser } = useLogin();

  const signUpUser = async () => {
    const url = `${API_URL}/signup`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(signUpValues),
    });

    const data = await res.json();

    if (res.ok) {
      console.log("success", data);
      // toast.success(data?.message);
      toast.success("Account Created Successfully");
      loginUser(signUpValues);
      // router.push("/user-signin");
      // router.push("/user-signin");
      // formik.resetForm();
    } else {
      console.log("error", data);
      toast.error(data?.message || "Something went wrong");
    }
  };
  return { signUpUser };
}

export default useSignUp;
