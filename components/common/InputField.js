import {
  ErrorMessage,
  Field,
  Formik,
  getIn,
  useField,
  useFormikContext,
} from "formik";
import { useEffect, useState } from "react";
import { BsPersonPlus } from "react-icons/bs";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

// export const TextField = ({ label, ...props }) => {
//   return (
//     <div className="">
//       <label {...props}>{label}</label>
//       <div className="relative mt-1">
//         <Field
//           className="w-full p-2 border outline-none bg-slate-100 border-slate-300 focus:border-slate-500"
//           {...props}
//         />
//         <p className="absolute text-xs text-red-600 -bottom-4">
//           <ErrorMessage {...props} />
//         </p>
//       </div>
//     </div>
//   );
// };

export const TextField = ({ label, ...props }) => {
  return (
    <div className="">
      <label className="font-semibold text-gray-600">
        {label}
        <div className="relative mt-1">
          <Field
            className="p-2.5 w-full outline-none text-sm bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow"
            // id={name}
            // name={name}
            {...props}
            required
          />
          <p className="absolute text-xs text-red-600 -bottom-4">
            <ErrorMessage {...props} />
          </p>
        </div>
      </label>
    </div>
  );
};

export const PasswordField = ({ label, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="">
      <label className="font-semibold text-gray-600">
        {label}
        <div className="relative mt-1">
          <Field
            className="p-2.5 w-full outline-none bg-gray-50 border border-gray-200 focus:border-gray-300 focus:shadow"
            // id={name}
            // name={name}
            {...props}
            type={showPassword ? "text" : "password"}
            autoComplete="on"
            required
          />
          <p className="absolute text-xs text-red-600 -bottom-4">
            <ErrorMessage {...props} />
          </p>
          <div className="absolute inset-y-0 flex items-center right-3">
            <span
              className="p-[6px] text-lg cursor-pointer hover:bg-gray-200 active:bg-gray-300 rounded-full text-black/60"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
            </span>
          </div>
        </div>
      </label>
    </div>
    // <div className="relative">
    //   <TextField
    //     label="Password *"
    //     name="password"
    //     type={showPassword ? "text" : "password"}
    //     autoComplete="on"
    //   />
    // <div
    //   className="absolute right-3 top-[30px] text-base p-[6px] cursor-pointer hover:bg-gray-200 active:bg-gray-300 rounded-full text-black/60"
    //   onClick={() => setShowPassword(!showPassword)}
    // >
    //   {/* {showPassword ? <FaRegEye /> : <FaRegEyeSlash />} */}
    //   {showPassword ? <MdVisibility /> : <MdVisibilityOff />}
    // </div>
    // </div>
  );
};

export const CheckboxField = ({ label, ...props }) => {
  const { setFieldValue } = useFormikContext();

  //for resetting checkbox previous value if current value changes
  useEffect(() => {
    if (props.resetonchange === "true") {
      setFieldValue(props.name, "");
    }
  }, [props.value, props.resetonchange, props.name, setFieldValue]);

  return (
    <div className="bg-gray-50">
      <label className="flex py-3.5 px-3 text-gray-600 text-sm font-semibold">
        <Field type="checkbox" {...props} className="mr-2" />
        {label}
      </label>
    </div>
  );
};
