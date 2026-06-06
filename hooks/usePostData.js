// import { API_URL } from "../config";
// import { useSession } from "next-auth/react";
// // import { useEffect, useState } from "react";
// import { toast } from "react-toastify";
// // import { useRouter } from "next/router";
// import { useRouter } from "next/navigation";
// import { Formik } from "formik";
// import useGetData from "./useGetData";

// function usePostData(path) {
//   // const [submitted, setSubmitted] = useState("");
//   // const { data } = useSession();
//   // const { token, id } = data ? data.user : "";

//   const { data: session } = useSession();

//   const adminId = session?.user?.id;

//   const router = useRouter();

//   // const { mutate, isLoading } = useGetData(`/all/poster/${adminId}`);

//   const url = `${API_URL}${path}`;

//   // console.log(url);

//   const postData = async (values, goto, formik) => {
//     // console.log(values);
//     // return;

//     const res = await fetch(url, {
//       method: "POST",
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//         // Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(values),
//     });

//     const data = await res.json();

//     if (res.ok) {
//       // mutate();
//       console.log("success", data);
//       toast.success("Submitted Succcessfully");
//       // setSubmitted(true);
//       goto && router.push(`${goto}`);
//       formik.resetForm();
//     } else {
//       console.log("error", data);
//       // setSubmitted(false);
//       toast.error(data.error);
//     }
//   };

//   return { postData };

//   // return { postData, submitted };
// }

// export default usePostData;

//with tanstack query
import axios from "axios";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../config";

function usePostData({
  path,
  revalidate,
  successMessage = "Submitted Succcessfully",
}) {
  const url = `${API_URL}${path}`;

  const queryClient = useQueryClient();

  //with fetch
  // const postFn = async (values) => {
  //   const res = await fetch(url, {
  //     method: "POST",
  //     headers: {
  //       Accept: "application/json",
  //       "Content-Type": "application/json",
  //       // Authorization: `Bearer ${token}`,
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
        // Authorization: `Bearer ${token}`,
      },
    };

    return axios.post(url, values, config);
  };

  return useMutation({
    mutationFn: postFn,
    onSuccess: () => {
      queryClient.invalidateQueries([revalidate]);
      toast.success(successMessage);
    },
    onError: (error) => {
      console.log("error is", error);
      toast.error(`${error.response.data.error}`);
    },
  });
}

export default usePostData;
