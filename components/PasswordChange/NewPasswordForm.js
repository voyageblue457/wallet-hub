import { PasswordField } from "../common/InputField";

function NewPasswordForm({ isLoading }) {
  return (
    <>
      <PasswordField label="Enter New Password *" name="password" autoFocus />
      <button
        type="submit"
        className="!mt-8 w-full py-3 bg-custom-blue2 rounded  hover:bg-custom-blue4 text-white font-bold active:scale-95 transition duration-300 disabled:pointer-events-none disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Loading" : "Change Password"}
      </button>
    </>
  );
}

export default NewPasswordForm;
