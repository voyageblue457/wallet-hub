import { FaImage } from "react-icons/fa";

function IDCardPage() {
  return (
    <div className="">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaImage />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">ID Card</h1>
      </div>

      <div className="mt-7">ID card</div>
    </div>
  );
}

export default IDCardPage;
