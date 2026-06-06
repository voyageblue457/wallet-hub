import { useEffect, useState } from "react";
import { FaRegBell } from "react-icons/fa";
import useToggle from "../../../hooks/useToggle";
import Pusher from "pusher-js";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
// import { notificationsData } from "./notificationsData";

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [unseenNotifications, setUnseenNotifications] = useState(0);

  const { toggle, setToggle, node } = useToggle();

  const { data: session } = useSession();

  const adminId = session?.user.adminId;

  // console.log("session", session);
  // console.log("notifications", notifications);

  const playNotificationSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play();
  };

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await window.Notification.requestPermission();
        if (permission === "granted") {
          // Permission granted, you can now use notifications
          console.log("Notification permission granted");
        } else {
          console.log("Notification permission denied");
        }
      } catch (error) {
        console.error("Error requesting notification permission:", error);
      }
    };

    requestNotificationPermission();

    if (adminId) {
      const pusher = new Pusher("05656b52c62c0f688ee3", {
        // APP_KEY
        cluster: "ap2",
        encrypted: true,
      });

      const channel = pusher.subscribe(adminId);
      channel.bind("new-notification", (data) => {
        setNotifications((prevNotifications) => [
          ...prevNotifications,
          `New collection added from ${data.name}`,
        ]);

        playNotificationSound();
        setUnseenNotifications((prevCount) => prevCount + 1);
        toast.success(`New collection added from ${data.name}`);
        console.log("notification:", data);
      });

      return () => {
        // channel.unbind_all();
        // channel.unbind(); // Unbind event listeners when component unmounts
        // pusher.unsubscribe("notifications");
        channel.unbind("new-notification"); // Unbind event listeners when component unmounts
        pusher.unsubscribe(adminId);
      };
    }
  }, [adminId]);

  const handleNotificationsClick = () => {
    setUnseenNotifications(0);
  };

  return (
    <div ref={node} className="relative">
      <div
        className="cursor-pointer group"
        onClick={() => {
          setToggle(!toggle);
          handleNotificationsClick();
        }}
      >
        <div
          className={`p-2 group-hover:bg-gray-200/50 rounded-full ${
            toggle && "bg-gray-200"
          }`}
        >
          <FaRegBell
            className={`text-xl ${toggle ? "text-blue-700" : "text-white"}`}
          />
        </div>
        {unseenNotifications > 0 && (
          <div className="absolute -top-3 -right-2 bg-indigo-900 border-2 border-white text-sm text-white rounded-full p-[2px] w-7 text-center shadow-lg">
            {unseenNotifications}
          </div>
        )}
      </div>

      {toggle && (
        <div className="absolute w-[400px] font-light top-[52px] right-0 bg-white shadow-md overflow-hidden">
          <p className="px-1 py-4 bg-[#212E34] text-white transition duration-300 text-center cursor-default">
            Notifications
          </p>

          <div className="divide-y overflow-y-auto max-h-[340px]">
            {notifications.length > 0 ? (
              notifications.map((notification, i) => (
                <div
                  key={i}
                  className="px-7 py-5 space-y-2 hover:bg-slate-100 transition duration-300 cursor-pointer"
                >
                  <p className="text-sm font-semibold">{notification}</p>
                  {/* <p className="text-xs font-light">{notification.time} ago</p> */}
                </div>
              ))
            ) : (
              <p className="py-5 text-sm text-center font-semibold">
                No new notifications
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notification;
