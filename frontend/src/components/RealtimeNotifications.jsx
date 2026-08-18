import { useEffect } from "react";
import toast from "react-hot-toast";
import socket from "../socket";

function RealtimeNotification() {
  useEffect(() => {
    const handleNotification = (data) => {
      console.log("REALTIME NOTIFICATION RECEIVED:", data);

      toast.success(`${data.title} - ${data.message}`);
    };

    socket.on("receive_notification", handleNotification);

    return () => {
      socket.off("receive_notification", handleNotification);
    };
  }, []);

  return null;
}

export default RealtimeNotification;
