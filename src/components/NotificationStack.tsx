import React, { useEffect, Dispatch, SetStateAction } from "react";
import NotificationPopup from "./NotificationPopup.tsx";
import { Notification } from "../utils/Types.tsx";

interface NotificationStackProps {
  notifications: Notification[];
  setNotifications: Dispatch<SetStateAction<Notification[]>>;
}

const NotificationStack: React.FC<NotificationStackProps> = ({
  notifications,
  setNotifications,
}) => {
  useEffect(() => {
    // Remove the notification after a certain duration (e.g., 5 seconds)
    if (notifications.length > 0) {
      const timer = setTimeout(() => {
        setNotifications([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line
  }, [notifications]);

  return (
    <div>
      {notifications.map((notification) => (
        <NotificationPopup index={notifications.indexOf(notification)} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationStack;
