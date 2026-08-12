import {
  useEffect,
} from "react"

import toast from "react-hot-toast"

import socket from "../socket"

function RealtimeNotifications() {

  useEffect(() => {

    socket.on(
      "receive_notification",
      (data) => {

      toast.success(
        `${data.title} - ${data.message}`
      )
    })

    return () => {

      socket.off(
        "receive_notification"
      )
    }

  }, [])

  return null
}

export default RealtimeNotifications