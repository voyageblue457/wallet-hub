import { Formik, Form } from "formik";
import Link from "next/link";
import { PasswordField, TextField } from "../components/common/InputField";
import useLogin from "../hooks/useLogin";
import { getSession } from "next-auth/react";

function SignInPage() {
  const initialvalues = {
    username: "",
    password: "",
  };

  const { loginUser } = useLogin();

  const handleSubmit = (values) => {
    loginUser(values);
    console.log(values);
  };

  return (
    <>
      <div className="flex justify-center items-center h-screen">
        {/* {loading && <FullPageLoader />} */}

        <div className="bg-white px-5 lg:px-10 py-14 shadow-lg rounded">
          <h1 className="text-2xl font-semibold text-center">Sign In</h1>
          <div className="mt-8">
            <Formik
              initialValues={initialvalues}
              // validationSchema={validate}
              onSubmit={handleSubmit}
            >
              {(formik) => (
                <Form>
                  <div className="text-sm gap-y-5 md:gap-y-7">
                    <div className="min-w-[300px] lg:min-w-[350px] space-y-4">
                      <TextField
                        label="Username *"
                        name="username"
                        type="text"
                      />

                      <PasswordField label="Password *" name="password" />
                    </div>
                    <button
                      type="submit"
                      className="mt-8 w-full py-3 bg-custom-blue2 rounded  hover:bg-custom-blue4 text-white font-bold active:scale-95 transition duration-300"
                    >
                      Sign In
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
            <div className="mt-5">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-400 hover:text-blue-900"
              >
                Forgot Password?
              </Link>
            </div>
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
        destination: "/amount",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}

export default SignInPage;
