import { useEffect, useState } from "react";
import { useFormikContext } from "formik";
import OtpInput from "react-otp-input";
// import { TextField } from "../common/InputField";

function OtpForm({ setStep, resetForm, isLoading }) {
  const otpTimeLimit = 2 * 60;
  const maxOtpLength = 6;

  const { values, setFieldValue } = useFormikContext();

  // console.log("values", values.otp.length);

  const otpValueLength = values.otp.length;

  const [seconds, setSeconds] = useState(otpTimeLimit);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const remainingSeconds = time % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  const timeLeft = formatTime(seconds);

  const handleOtpChange = (otp) => {
    // Update Formik values when OTP changes
    setFieldValue("otp", otp);
  };

  return (
    <>
      <div className="">
        {timeLeft !== "00:00" ? (
          <>
            <div className="text-center font-semibold">
              <p className="text-sm  text-gray-600">
                An OTP has been sent to{" "}
                <span className="text-blue-600 font-bold">{values.number}</span>
                . Please enter the OTP within 2 minutes.
              </p>
              <p className="mt-2 text-base">
                Time left:{" "}
                <span className="w-[60px] inline-flex">{timeLeft}</span>
              </p>
            </div>
            {/* <TextField label="Enter OTP *" name="otp" type="text" /> */}
            <div className="mt-5">
              <label className="font-semibold text-gray-600">Enter OTP *</label>
              <OtpInput
                value={values.otp}
                onChange={(otp) => handleOtpChange(otp)}
                numInputs={maxOtpLength}
                renderSeparator={<span className="text-lg font-bold"> - </span>}
                inputStyle="!w-10 h-10 border-2 border-gray-300 rounded-md focus:border-gray-600 focus:shadow outline-none"
                containerStyle="flex justify-between mt-2"
                shouldAutoFocus
                renderInput={(props) => <input {...props} />}
              />
            </div>
            {
              <button
                type="submit"
                className="!mt-8 w-full py-3 bg-custom-blue2 rounded  hover:bg-custom-blue4 text-white font-bold active:scale-95 transition duration-300 disabled:pointer-events-none disabled:opacity-50"
                disabled={otpValueLength < maxOtpLength || isLoading}
              >
                {isLoading ? "Loading" : "Next Step"}
              </button>
            }
          </>
        ) : (
          <>
            <p className="text-sm text-center font-semibold text-red-600">
              {`Time's up! Please try again.`}
            </p>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                resetForm();
                setSeconds(otpTimeLimit);
              }}
              className="!mt-8 w-full py-3 bg-red-600 rounded  hover:bg-red-500 text-white font-bold active:scale-95 transition duration-300"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default OtpForm;
