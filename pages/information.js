import { FaEnvelope } from "react-icons/fa";

function InformationPage() {
  return (
    <div className="">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaEnvelope />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">Information</h1>
      </div>
    </div>
  );
}

export default InformationPage;
