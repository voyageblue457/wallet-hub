import { Oval } from "react-loader-spinner";

function Spinner() {
  return (
    <>
      <Oval
        height={33}
        width={33}
        color="#4fa94d"
        wrapperStyle={{}}
        wrapperClass=""
        visible={true}
        ariaLabel="oval-loading"
        secondaryColor="#4fa94d"
        strokeWidth={5}
        strokeWidthSecondary={2}
      />
    </>
  );
}

export default Spinner;
