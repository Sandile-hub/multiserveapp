import {
  useEffect,
  useState,
} from "react"

import API from "../../api/axios"

function Notifications() {

  const [notifications,
    setNotifications] =
    useState([])

  const [loading, setLoading] =
    useState(true)

  const fetchNotifications =
  async () => {

    try {

      const res = await API.get(
        "/notifications"
      )

      setNotifications(res.data)

    } catch (error) {

      console.log(error)

    } finally {

      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // MARK READ
  const markAsRead = async (id) => {

    try {

      await API.put(
        `/notifications/read/${id}`
      )

      fetchNotifications()

    } catch (error) {

      console.log(error)
    }
  }

  if (loading) {

    return (
      <div className="
        min-h-screen
        bg-slate-950
        text-white
        flex items-center justify-center
      ">
        Loading...
      </div>
    )
  }

  return (
    <div className="
      min-h-screen
      bg-slate-950
      text-white
      p-8
    ">

      <h1 className="
        text-5xl
        font-bold
        mb-8
      ">
        Notifications
      </h1>

      <div className="
        space-y-6
      ">

        {notifications.map(
          (notification) => (

          <div
            key={notification.id}
            className={`
              p-6
              rounded-3xl
              border
              backdrop-blur-lg
              ${
                notification.is_read
                ? `
                  bg-white/5
                  border-white/10
                `
                : `
                  bg-indigo-500/20
                  border-indigo-500/30
                `
              }
            `}
          >

            <h2 className="
              text-2xl
              font-bold
              mb-2
            ">
              {notification.title}
            </h2>

            <p className="
              text-slate-300
              mb-4
            ">
              {notification.message}
            </p>

            {!notification.is_read && (

              <button
                onClick={() =>
                  markAsRead(
                    notification.id
                  )
                }
                className="
                  bg-indigo-600
                  hover:bg-indigo-700
                  px-5 py-3
                  rounded-xl
                  font-bold
                "
              >
                Mark as Read
              </button>
            )}

          </div>

        ))}

      </div>

    </div>
  )
}

export default Notifications