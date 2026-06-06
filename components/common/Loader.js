import React from "react";
import { ThreeCircles } from "react-loader-spinner";

function Loader({ isLoading, children }) {
  const loader = (
    <ThreeCircles
      height="100"
      width="100"
      color="#7A80B4"
      wrapperStyle={{}}
      wrapperClass=""
      visible={true}
      ariaLabel="three-circles-rotating"
      outerCircleColor=""
      innerCircleColor=""
      middleCircleColor=""
    />
  );

  return (
    <>
      {isLoading && (
        <div className="absolute flex justify-center items-center h-[calc(100vh-100px)] inset-0">
          {loader}
        </div>
      )}

      {!isLoading && <>{children}</>}
    </>
  );
}

export default Loader;
