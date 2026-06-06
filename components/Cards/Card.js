import Link from "next/link";
import CountUp from "react-countup";
// import { TbCurrencyTaka } from "react-icons/tb";
import { FaArrowAltCircleRight } from "react-icons/fa";
// import { motion } from "framer-motion";

function Card({ title, count, link }) {
  return (
    <Link href={link} passHref>
      {/* <motion.div
          whileHover={{
            scale: 1.03,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="bg-white min-h-[150px] px-8 py-6 gap-40 shadow-md hover:shadow-lg transition-shadow duration-300 rounded group cursor-pointer"
        > */}
      <div className="bg-white min-h-[150px] px-8 py-6 gap-40 shadow-md hover:shadow-lg transition-shadow duration-300 rounded group cursor-pointer">
        <div className="space-y-4">
          <h1 className="capitalize text-[15px] text-custom-indigo2 font-semibold">
            {title}
          </h1>
          <div className="text-custom-gray2 font-semibold text-[33px]">
            {count ? (
              <div className="flex  items-center">
                {/* <TbCurrencyTaka /> */}
                <CountUp end={count} duration={1} />
              </div>
            ) : (
              "---"
            )}
          </div>
          <div className="flex justify-end items-center gap-1 text-gray-400 text-sm font-semibold group-hover:underline underline-offset-2">
            <p className=" text-end">Details</p>
            <FaArrowAltCircleRight />
          </div>
        </div>
      </div>
      {/* </motion.div> */}
    </Link>
  );
}

export default Card;
