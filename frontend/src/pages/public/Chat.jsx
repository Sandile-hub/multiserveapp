import {
  useEffect,
  useState,
} from "react"

import socket from "../../socket"

function Chat() {

  const [message,
    setMessage] =
    useState("")

  const [messages,
    setMessages] =
    useState([])

  const [receiverId,
    setReceiverId] =
    useState("")

  // RECEIVE
  useEffect(() => {

    socket.on(
      "receive_message",
      (data) => {

      setMessages((prev) => [
        ...prev,
        data,
      ])
    })

    return () => {

      socket.off(
        "receive_message"
      )
    }

  }, [])

  // SEND
  const sendMessage = () => {

    if (!message) return

    const data = {
      receiverId,
      message,
    }

    socket.emit(
      "send_message",
      data
    )

    setMessages((prev) => [
      ...prev,
      {
        ...data,
        self: true,
      },
    ])

    setMessage("")
  }

  return (
    <div className="
      min-h-screen
      bg-slate-950
      text-white
      p-8
    ">

      <div className="
        max-w-4xl
        mx-auto
      ">

        <h1 className="
          text-5xl
          font-black
          mb-8
        ">
          Live Chat
        </h1>

        <input
          type="text"
          placeholder="
          Receiver User ID
          "
          value={receiverId}
          onChange={(e) =>
            setReceiverId(
              e.target.value
            )
          }
          className="
            w-full
            p-4
            rounded-2xl
            bg-white/10
            border border-white/10
            mb-6
          "
        />

        <div className="
          bg-white/10
          border border-white/10
          rounded-3xl
          p-6
          h-[500px]
          overflow-y-auto
          mb-6
        ">

          <div className="
            flex
            flex-col
            gap-4
          ">

            {messages.map(
              (msg, index) => (

              <div
                key={index}
                className={`
                  max-w-[70%]
                  p-4
                  rounded-2xl
                  ${
                    msg.self
                    ? `
                      bg-indigo-600
                      self-end
                    `
                    : `
                      bg-slate-700
                    `
                  }
                `}
              >
                {msg.message}
              </div>

            ))}

          </div>

        </div>

        <div className="
          flex gap-4
        ">

          <input
            type="text"
            placeholder="
            Type message...
            "
            value={message}
            onChange={(e) =>
              setMessage(
                e.target.value
              )
            }
            className="
              flex-1
              p-4
              rounded-2xl
              bg-white/10
              border border-white/10
            "
          />

          <button
            onClick={sendMessage}
            className="
              bg-indigo-600
              hover:bg-indigo-700
              px-8
              rounded-2xl
              font-bold
            "
          >
            Send
          </button>

        </div>

      </div>

    </div>
  )
}

export default Chat