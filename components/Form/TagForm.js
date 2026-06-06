import * as Yup from "yup";
import { Form, Formik } from "formik";
import usePostData from "../../hooks/usePostData";
import { TextField, CheckboxField } from "../common/InputField";
import { toast } from "react-toastify";

function TagForm({ id, initialTag, initialShowTagField }) {
  const { mutate, isLoading } = usePostData({
    path: "/user/update/tag",
    // revalidate: `/user/details/${id}`,
  });

  const initialValues = {
    tag: initialTag || "",
    showTagField: initialShowTagField || false,
  };

  const validate = Yup.object({
    tag: Yup.string().when("showTagField", {
      is: true,
      then: Yup.string().required("Tag name is required when field is enabled"),
    }),
  });

  const handleSubmit = (values) => {
    const submitValues = {
      id,
      ...values,
    };

    mutate(submitValues, {
      onSuccess: () => {
        toast.success("Tag settings updated successfully");
      },
    });
  };

  return (
    <div className="mt-7">
      <Formik
        initialValues={initialValues}
        validationSchema={validate}
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {(formik) => (
          <Form>
            <h1 className="text-lg font-semibold ">Manage QR Tag</h1>
            <p className="text-sm text-gray-500 mt-1">
              Enable an input field for payers to enter a tag (e.g. Order ID, Username) after scanning the QR code.
            </p>
            <div className="pt-7 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5 md:gap-y-7 items-end">
              <div className="flex items-center gap-4 border p-4 rounded-lg">
                <CheckboxField 
                    label="Enable Tag Input Field" 
                    name="showTagField" 
                />
              </div>
              <TextField 
                label="Tag Name (e.g. 'Enter your Username') *" 
                name="tag" 
                type="text" 
                disabled={!formik.values.showTagField}
              />
            </div>
            <div className="mt-10 flex justify-start">
              <button
                type="submit"
                className="px-9 py-4 text-white text-xs tracking-widest font-bold rounded bg-custom-blue5 hover:bg-custom-blue active:scale-95 transition duration-300 uppercase disabled:bg-opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                Update Tag Settings
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default TagForm;
