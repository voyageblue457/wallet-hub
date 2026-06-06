import axios from "axios";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../config";

function usePasswordReset({ path }) {
  const url = `${API_URL}${path}`;

  // const queryClient = useQueryClient();

  //with fetch
  // const postFn = async (values) => {
  //   const res = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify(values),
  //   });

  //   const data = await res.json();

  //   if (res.ok) {
  //     return data;
  //   } else {
  //     // console.log("data error", data);
  //     throw new Error(data.error);
  //   }
  // };

  //with axios
  const postFn = (values) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };

    return axios.post(url, values, config);
  };

  return useMutation({
    mutationFn: postFn,
    onSuccess: (data) => {
      // toast.success(successMessage);
      console.log("success", data);
    },
    onError: (error) => {
      console.log("error is", error);
      toast.error(`${error.response.data.e}`);
    },
  });
}

export default usePasswordReset;
