import { useState, useRef, useEffect } from "react";

function useToggle() {
  const [toggle, setToggle] = useState("");
  const node = useRef(null);

  useEffect(() => {
    document.addEventListener("mousedown", clickOutside);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
    };
  }, []);

  const clickOutside = (e) => {
    if (node?.current?.contains(e.target)) {
      return;
    }
    setToggle(false);
  };

  return { toggle, setToggle, node };
}

export default useToggle;
