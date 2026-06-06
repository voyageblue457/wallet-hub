import { useEffect, useState } from "react";
import Router, { useRouter } from "next/router";
// import * as Yup from "yup";
import { Formik, Form } from "formik";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
// import useLogin from "../Hooks/useLogin";
// import { signIn, useSession } from "next-auth/react";
// import Cookies from "js-cookie";
// import Loader from "../Layout/Loader";

// import { BsEyeSlash, BsEye } from "react-icons/bs";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { FaRegEyeSlash, FaRegEye } from "react-icons/fa";
import Link from "next/link";
import { PasswordField, TextField } from "../components/common/InputField";
import useLogin from "../hooks/useLogin";
import useSignUp from "../hooks/useSignUp";

function SignUpPage({ user, loginRoute, dashboardRoute }) {
  const [passwordMatchError, setPasswordMatchError] = useState(false);
  // const [loading, setLoading] = useState();

  // Router.events.on("routeChangeStart", (url) => {
  //   setLoading(true);
  // });
  // Router.events.on("routeChangeComplete", (url) => {
  //   setLoading(false);
  // });
  // Router.events.on("routeChangeError", (url) => {
  //   setLoading(false);
  // });

  const initialvalues = {
    email: "",
    password: "",
    confirm_password: "",
  };

  // const validate =
  //   user === "super admin"
  //     ? Yup.object({
  //         email: Yup.string().required("Email is required"),
  //         password: Yup.string().required("Password is required"),
  //       })
  //     : Yup.object({
  //         identity_id: Yup.string().required("Institution Code is required"),
  //         email: Yup.string().required("Email is required"),
  //         password: Yup.string().required("Password is required"),
  //       });

  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  // const { loginUser } = useLogin(loginRoute, dashboardRoute);

  // const handleSubmit = (values) => {
  //   // loginUser(values);
  //   console.log(values);
  // };

  const { loginUser } = useLogin();
  const { signUpUser } = useSignUp();

  const handleSubmit = (values) => {
    const { email, password, confirm_password } = values;
    const signUpValues = {
      email: email,
      password: password,
    };

    if (password !== confirm_password) {
      setPasswordMatchError(true);
    } else {
      // console.log({ name, email, password });
      setPasswordMatchError(false);
      signUpUser(signUpValues);
      console.log(signUpValues);
    }
  };

  // const handleSubmit = async (values, formik) => {
  //   const { name, email, password, retype_password } = values;
  //   if (password !== retype_password) {
  //     setPasswordMatchError(true);
  //   } else {
  //     // console.log({ name, email, password });
  //     setPasswordMatchError(false);

  //     // postData(values);

  //     const url = `${API_URL}/user/signup`;

  //     const res = await fetch(url, {
  //       method: "POST",
  //       headers: {
  //         Accept: "application/json",
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ name, email, password }),
  //     });

  //     const data = await res.json();

  //     if (res.ok) {
  //       console.log("success", data);
  //       // toast.success(data?.message);
  //       toast.success("Account Created Successfully");
  //       loginUser({ email, password });
  //       // router.push("/user-signin");
  //       // router.push("/user-signin");
  //       // formik.resetForm();
  //     } else {
  //       console.log("error", data);
  //       toast.error(data?.message);
  //     }
  //   }
  // };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        {/* {loading && <FullPageLoader />} */}

        <div className="bg-white px-10 py-14 shadow-lg rounded">
          <h1 className="text-2xl font-semibold text-center">Create Account</h1>
          <div className="mt-8">
            <Formik
              initialValues={initialvalues}
              // validationSchema={validate}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <Form>
                  <div className="text-sm gap-y-5 md:gap-y-7">
                    <div className="lg:min-w-[350px] space-y-4">
                      <TextField label="Email *" name="email" type="email" />
                      <PasswordField label="Password *" name="password" />
                      <PasswordField
                        label="Confirm Password *"
                        name="confirm_password"
                      />
                      {/* <div className="relative">
                        <TextField
                          label="Password *"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="on"
                        />
                        <div
                          className="absolute right-3 top-[30px] text-base p-[6px] cursor-pointer hover:bg-gray-200 active:bg-gray-300 rounded-full text-black/60"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          
                          {showPassword ? (
                            <MdVisibility />
                          ) : (
                            <MdVisibilityOff />
                          )}
                        </div>
                      </div> */}
                    </div>
                    <button
                      type="submit"
                      className="mt-8 w-full py-3 bg-custom-blue2 rounded  hover:bg-custom-blue4 text-white font-bold active:scale-95 transition duration-300"
                    >
                      Sign Up
                    </button>
                    {/* <span className="ml-5 text-sm text-green-600 ">
                      {status === "loading" && <p>logging in</p>}
                    </span> */}

                    <p className="mt-6 text-sm text-custom-blue4 hover:text-custom-blue transition duration-300">
                      <Link href="/sign-in">
                        Already have an account? Sign in here
                      </Link>
                    </p>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
