import { useSession } from "next-auth/react";
import { useState } from "react";
import { FaQrcode } from "react-icons/fa";
import Loader from "../components/common/Loader";
import useGetData from "../hooks/useGetData";
import { useQRCode } from "next-qrcode";
import AdminQR from "../components/QRCode/AdminQR";
import PosterQR from "../components/QRCode/PosterQR";

function QRCodepage() {
  const [selectedSite, setSelectedSite] = useState("");

  const { data: session } = useSession();
  const { id, admin, adminId, qrCodeStatus } = session ? session.user : "";

  const isAdmin = !admin && 0;

  const { data: qrCode, isLoading } = useGetData(
    `/qrcode/status/check/${adminId}`
  );

  const apiLink = admin ? `/all/poster/${id}` : `/link/get/${id}/${isAdmin}`;
  const { data: fetchedData2, isLoading: isLoading2 } = useGetData(apiLink);


  // console.log("qrcode", fetchedData2.data);

  const { Image } = useQRCode();

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <span className="text-[28px] text-custom-blue2">
          <FaQrcode />
        </span>
        <h1 className="text-2xl font-bold text-custom-gray2">QR Code</h1>
      </div>

      <Loader isLoading={isLoading || isLoading2}>
        {/* {qrCode?.data.status === true ? ( */}
        {qrCodeStatus === true ? (
          <div className="mt-7 flex flex-col lg:flex-row gap-5">
            <div className="lg:sticky top-[95px] lg:self-start lg:min-w-[450px] min-h-[300px] bg-white p-8 rounded shadow-md">
              <h4 className="text-xl font-semibold">Generate QR Code</h4>
              <p className="mt-2 text-sm font-semibold text-custom-gray3">
                Site: {selectedSite}
              </p>
              <div className="mt-3 flex justify-center">
                {selectedSite && <Image text={selectedSite} alt="qr code" />}
              </div>
            </div>

            <div className="flex-1 bg-white rounded shadow-md p-8 overflow-x-auto">
              <h4 className="text-xl font-semibold">All Links</h4>
              <div className="mt-3 w-[350px] lg:w-[500px]">
                {!admin ? (
                  <PosterQR
                    id={id}
                    isAdmin={isAdmin}
                    selectedSite={selectedSite}
                    setSelectedSite={setSelectedSite}
                    fetchedData2={fetchedData2?.data}
                  />
                ) : (
                  <AdminQR
                    id={id}
                    admin={admin}
                    adminId={adminId}
                    selectedSite={selectedSite}
                    setSelectedSite={setSelectedSite}
                    fetchedData2={fetchedData2?.data}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-20 text-xl text-center font-semibold">
            QR Code Inactive. Contact with admin to activate this feature.
          </div>
        )}
      </Loader>
    </div>
  );
}

export default QRCodepage;
