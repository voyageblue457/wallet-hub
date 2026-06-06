import { useState } from "react";
import { useRouter } from "next/router";
import { Formik, Form } from "formik";
import { toast } from "react-toastify";
import { getSession } from "next-auth/react";
import PhoneNumberForm from "../components/PasswordChange/PhoneNumberForm";
import OtpForm from "../components/PasswordChange/OtpForm";
import NewPasswordForm from "../components/PasswordChange/NewPasswordForm";
import usePasswordReset from "../hooks/usePasswordReset";

function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const initialvalues = {
    username: "",
      password: "",
      email: "",
    otp: "",
   
  };

  // const { mutate: phoneMutate, isLoading: phoneIsLoading } = usePasswordReset({
  //   path: "/change/password/otp/once",
  // });
  const { mutate: emailMutate, isLoading: emailIsLoading } = usePasswordReset({
    path: "/email/otp",
  });

  const { mutate: otpMutate, isLoading: otpIsLoading } = usePasswordReset({
    path: "/user/check/otp",
  });

  const { mutate: passwordMutate, isLoading: passwordIsLoading } =
    usePasswordReset({
      path: "/change/password",
    });

  const handleSubmit = (values, formik) => {
    // if (step === 1) {
    //   const values1 = {
    //     username: values.username,
    //     password: values.password,
    //   };
    //   console.log("step 1 values", values1);
    //   passwordMutate(values1,{
    //     onSuccess: () => {
    //       formik.resetForm();
    //       router.push("/sign-in");
    //       toast.success("Password changed successfully");
    //     },
    //   });

      // phoneMutate(values1, {
      //   onSuccess: () => {
      //     setStep(2);
      //   },
      // });
      if (step === 1) {
        const values1 = {
          username: values.username,
          email: values.email,
        };
        // console.log("step 1 values", values1);
  
        emailMutate(values1, {
          onSuccess: () => {
            setStep(2);
          },
        });
      }
    
    else if (step === 2) {
      const values2 = {
        username: values.username,
        otp: values.otp,
      };
      // console.log("step 2 values", values2);
      otpMutate(values2, {
        onSuccess: () => {
          setStep(3);
        },
      });
    } 
    else if (step === 3) {
      const values3 = {
        username: values.username,
        otp: values.otp,
        password: values.password,
      };
      // console.log("step 3 values", values3);
      passwordMutate(values3, {
        onSuccess: () => {
          formik.resetForm();
          router.push("/sign-in");
          toast.success("Password changed successfully");
        },
      });
    }
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        {/* {loading && <FullPageLoader />} */}

        <div className="bg-white px-5 lg:px-10 py-14 shadow-lg rounded">
          <h1 className="text-2xl font-semibold text-center">
            Change Password
          </h1>
          {/* <p className="my-4 font-bold text-center text-lg text-gray-700">{`Step: ${step}/3`}</p> */}
          <div className="mt-8">
            <Formik
              initialValues={initialvalues}
              // validationSchema={validate}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <Form>
                  <div className="text-sm gap-y-5 md:gap-y-7">
                    <div className="min-w-[300px] max-w-[320px] lg:w-[350px] space-y-4">
                      {step === 1 && (
                        <PhoneNumberForm isLoading={emailIsLoading } />
                      )}
                       {step === 2 && (
                        <OtpForm
                          setStep={setStep}
                          resetForm={formik.resetForm}
                          isLoading={otpIsLoading}
                        />
                      )}
                      {step === 3 && (
                        <NewPasswordForm isLoading={passwordIsLoading} />
                      )} 
                    </div>
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

export async function getServerSideProps(context) {
  const session = await getSession(context);

  if (session) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default ForgotPasswordPage;

// import { Formik, Form } from "formik";
// import { PasswordField, TextField } from "../components/common/InputField";
// import { getSession } from "next-auth/react";
// import usePostData from "../hooks/usePostData";
// import { useRouter } from "next/router";

// function ForgotPasswordPage() {
//   const router = useRouter();

//   const initialvalues = {
//     username: "",
//     password: "",
//   };

//   const { mutate, isLoading, isError, error, isSuccess } = usePostData({
//     path: "/change/password",
//     successMessage: "Password changed successfully",
//   });

//   const handleSubmit = (values, formik) => {
//     // console.log(values);
//     // const goto = "/sign-in";
//     // postData(values, goto, formik);
//     mutate(values, {
//       onSuccess: () => {
//         formik.resetForm();
//         router.push("/sign-in");
//       },
//     });
//   };

//   return (
//     <>
//       <div className="flex justify-center items-center h-screen">
//         {/* {loading && <FullPageLoader />} */}

//         <div className="bg-white px-5 lg:px-10 py-14 shadow-lg rounded">
//           <h1 className="text-2xl font-semibold text-center">
//             Change Password
//           </h1>
//           <div className="mt-8">
//             <Formik
//               initialValues={initialvalues}
//               // validationSchema={validate}
//               onSubmit={handleSubmit}
//             >
//               {(formik) => (
//                 <Form>
//                   <div className="text-sm gap-y-5 md:gap-y-7">
//                     <div className="min-w-[300px] lg:min-w-[350px] space-y-4">
//                       <TextField
//                         label="Admin Username *"
//                         name="username"
//                         type="text"
//                       />

//                       <PasswordField label="New Password *" name="password" />
//                     </div>
//                     <button
//                       type="submit"
//                       className="mt-8 w-full py-3 bg-custom-blue2 rounded  hover:bg-custom-blue4 text-white font-bold active:scale-95 transition duration-300"
//                     >
//                       Submit
//                     </button>
//                   </div>
//                 </Form>
//               )}
//             </Formik>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export async function getServerSideProps(context) {
//   const session = await getSession(context);

//   if (session) {
//     return {
//       redirect: {
//         destination: "/",
//         permanent: false,
//       },
//     };
//   }

//   return {
//     props: {},
//   };
// }

// export default ForgotPasswordPage;
