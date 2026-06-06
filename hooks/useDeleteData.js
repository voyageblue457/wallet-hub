import axios from "axios";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "../config";

function useDeleteData({ path, revalidate }) {
  const url = `${API_URL}${path}`;

  const queryClient = useQueryClient();

  const deleteFn = () => {
    return axios.delete(url);
  };

  return useMutation({
    mutationFn: deleteFn,
    onSuccess: () => {
      queryClient.invalidateQueries([revalidate]);
      // toast.success("Deleted Succcessfully");
    },
    onError: (error) => {
      console.log("error is", error);
      toast.error(`${error.response.data.error}`);
    },
  });
}

export default useDeleteData;
