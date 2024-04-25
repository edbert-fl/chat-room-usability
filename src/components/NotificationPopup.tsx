import React, { useState, useEffect } from "react";
import { RiCheckLine, RiErrorWarningLine } from "react-icons/ri";
import { Notification } from "../utils/Types";

interface NotificationPopupProps {
  index: number;
  notification: Notification;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  index,
  notification,
}) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`fixed right-10 flex items-center bg-black bg-opacity-80 text-white px-4 py-2 rounded-md transition-all duration-500 ${
        show ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
      }`}
      style={{ top: `${(index * 3 + 2.5).toString()}rem` }}
    >
      {notification.success ? (
        <RiCheckLine className="text-green-500 mr-2" />
      ) : (
        <RiErrorWarningLine className="text-red-500 mr-2" />
      )}
      <span className="text-sm">
        {notification.message}
      </span>
    </div>
  );
};

export default NotificationPopup;
