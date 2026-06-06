// import { useSession } from "next-auth/react";
// import useSWR from "swr";
// import { API_URL } from "../config";
// // import Cookies from "js-cookie";
// // import { useEffect, useState } from "react";
// // import { useQuery } from "react-query";
// // import { API_URL, token, id, identity_id } from "../../config";

// function useGetData(route) {
//   const { data: session, status } = useSession();
//   // const { token, id, identity_id } = data ? data.user : "";

//   // console.log("access data is", data);

//   // const id = Cookies.get("id");

//   //with react-query
//   // const url = `${API_URL}/${route}/${id}/${identity_id ? identity_id : ""}`;

//   // const fetcher = async () => {
//   //   const res = await fetch(url, {
//   //     headers: {
//   //       "Content-Type": "application/json",
//   //       Authorization: `Bearer ${token}`,
//   //     },
//   //   });
//   //   const fetchedData = await res.json();

//   //   console.log("fetched", fetchedData);
//   //   return fetchedData.data;
//   // };

//   // const {
//   //   isLoading,
//   //   isError,
//   //   error,
//   //   data: fetchedData,
//   // } = useQuery(route, fetcher);

//   // return {
//   //   fetchedData: fetchedData ? fetchedData : "",
//   //   isLoading,
//   //   isError,
//   //   // error: error.data,
//   // };

//   //with swr
//   const fetcher = async (url) => {
//     const res =
//       // status === "authenticated" &&
//       session &&
//       (await fetch(url, {
//         headers: {
//           "Content-Type": "application/json",
//           // Authorization: `Bearer ${token}`,
//         },
//       }));
//     const fetchedData = await res.json();

//     console.log("fetched", fetchedData);
//     return fetchedData;
//   };

//   const url = `${API_URL}${route}`;
//   // console.log("test", url);
//   // const { data: fetchedData, error } = useSWR(`${API_URL}${route}`, fetcher);
//   const {
//     data: fetchedData,
//     isLoading,
//     // isValidating,
//     error,
//     mutate,
//   } = useSWR(url, fetcher);

//   return {
//     fetchedData: fetchedData ? fetchedData : "",
//     // isLoading: !error && !fetchedData,
//     isLoading,
//     isError: error,
//     mutate,
//     // isValidating,
//   };

//   // with useEffect
//   // const [fetchedData, setFetechedData] = useState("");

//   // const url = `${API_URL}${route}`;

//   // useEffect(() => {
//   //   const fetcher = async () => {
//   //     const res = await fetch(url);
//   //     const data = await res.json();

//   //     if (res.ok) {
//   //       setFetechedData(data);
//   //       console.log("success", data);
//   //     } else {
//   //       console.log("error", data);
//   //     }
//   //   };

//   //   fetcher();
//   // }, [route]);

//   // return { fetchedData };
// }

// export default useGetData;

// with useEffect
// import { useSession } from "next-auth/react";
// import { API_URL } from "../config";
// import { useEffect, useState } from "react";

// function useGetData(route) {
//   const { data: session, status } = useSession();

//   // const token = session?.user?.token;

//   // with useEffect
//   const [fetchedData, setFetchedData] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const [isError, setIsError] = useState(false);

//   const url = `${API_URL}${route}`;

//   useEffect(() => {
//     const fetcher = async () => {
//       // setIsLoading(true);
//       !fetchedData && setIsLoading(true);

//       try {
//         const res = await fetch(url, {
//           headers: {
//             "Content-Type": "application/json",
//             // Authorization: `Bearer ${token}`,
//           },
//         });

//         const data = await res.json();

//         setFetchedData(data);
//         setIsLoading(false);
//         console.log("success", data);
//       } catch (error) {
//         console.log("error", error);
//         setIsLoading(false);
//         setIsError(true);
//       }

//       // const res = await fetch(url, {
//       //   headers: {
//       //     "Content-Type": "application/json",
//       //     Authorization: `Bearer ${token}`,
//       //   },
//       // });

//       // const data = await res.json();

//       // if (res.ok) {
//       //   setFetchedData(data);
//       //   setIsLoading(false);
//       //   console.log("success", data);
//       // } else {
//       //   console.log("error", data);
//       //   setIsLoading(false);
//       //   setIsError(true);
//       // }
//     };

//     // session && !fetchedData && fetcher();
//     session && fetcher();
//   }, [session]);

//   return { fetchedData, isLoading, isError };
// }

// export default useGetData;

//with tanstack-query
import { useSession } from "next-auth/react";
import { API_URL } from "../config";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

function useGetData(route) {
  const { data: session } = useSession();

  const url = `${API_URL}${route}`;

  const fetcher = () => {
    // const res = await fetch(url, {
    //   headers: {
    //     "Content-Type": "application/json",
    //     // Authorization: `Bearer ${token}`,
    //   },
    // });
    // const fetchedData = await res.json();

    // console.log("fetched", fetchedData);
    // return fetchedData;
    const config = {
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${token}`,
      },
    };

    return axios.get(url, config);
  };

  const isRouteValid = route && !route.includes("undefined") && !route.includes("null");

  return useQuery({
    queryKey: [route],
    queryFn: fetcher,
    enabled: !!session && !!isRouteValid,
    retry: false,
  });

  // const {
  //   isLoading,
  //   isError,
  //   data: fetchedData,
  // } = useQuery({ queryKey: [route], queryFn: fetcher, enabled: !!session });

  // return {
  //   fetchedData: fetchedData ? fetchedData : "",
  //   isLoading,
  //   isError,
  //   // error: error.data,
  // };
}

export default useGetData;
