import { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import API from "../../api/axios";
import ProviderSidebar from "../../components/provider/ProviderSidebar";
import ProviderNavbar from "../../components/provider/ProviderNavbar";
import {
  Send,
  Search,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Loader2,
  MessagesSquare,
  Circle,
} from "lucide-react";
import "../../styles/Provider.css";

const socket = io("http://localhost:5000");

function ProviderChat() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // STATES
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const messagesEndRef = useRef(null);

  // SOCKET CONNECT
  useEffect(() => {
    if (user?.id) {
      socket.emit("register_user", user.id);
    }
    return () => {
      socket.off("receive_message");
    };
  }, [user]);

  // FETCH CHATS
const fetchChats = async () => {

  try {

    const res =
    await API.get(
      "/messages/provider"
    );

    setCustomers(
      res.data || []
    );

    // AUTO SELECT FIRST CHAT

    if (res.data?.length > 0) {

      setSelectedChat(
        res.data[0]
      );

      loadMessages(
        res.data[0].id
      );
    }

  } catch (error) {

    console.error(
      "Error fetching chats:",
      error
    );

  } finally {

    setLoadingChats(false);
  }
};

  useEffect(() => {
    fetchChats();
  }, []);

  // LOAD MESSAGES
  const loadMessages = async (conversation_id) => {
    try {
      setLoadingMessages(true);
      const res = await API.get(`/messages/${conversation_id}`);
      setMessages(res.data || []);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // RECEIVE MESSAGE
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // UPDATE ACTIVE CHAT

      if (selectedChat && data.conversation_id === selectedChat.id) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg.id === data.id);

          if (exists) return prev;

          return [...prev, data];
        });
      }

      // UPDATE CHAT LIST

      setCustomers((prev) =>
        prev.map((chat) =>
          chat.id === data.conversation_id
            ? {
                ...chat,
                last_message: data.message,
                last_message_time: data.created_at,
              }
            : chat,
        ),
      );
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedChat]);


  // AUTO SCROLL
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const handleSend = async () => {
    if (!message.trim() || !selectedChat) return;

    try {
      setLoading(true);
      await API.post("/messages/send", {
        conversation_id: selectedChat.id,
        receiver_id: selectedChat.customer_id,
        message,
      });

      const newMessage = {
        conversation_id: selectedChat.id,
        sender_id: user.id,
        message,
        created_at: new Date(),
      };

      socket.emit("send_message", newMessage);
      setMessages((prev) => [...prev, newMessage]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  // FILTERED CHATS
  const filteredChats = customers.filter((customer) =>
    customer.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="provider-dashboard">
      <ProviderSidebar />

      <div className="provider-main">
        <ProviderNavbar />

        <div className="provider-main-content chat-page">
          {/* HERO SECTION */}
          <div className="chat-hero">
            <div className="chat-hero-bg" />
            <div className="chat-hero-content">
              <div className="chat-hero-badge">
                <MessagesSquare size={16} />
                Realtime Chat
              </div>
              <h1 className="chat-hero-title">Customer Messages 💬</h1>
              <p className="chat-hero-description">
                Manage customer conversations in realtime using your live
                messaging system.
              </p>
            </div>
          </div>

          {/* CHAT CONTAINER */}
          <div className="chat-container">
            {/* SIDEBAR - CHAT LIST */}
            <div className="chat-sidebar">
              {/* Search */}
              <div className="chat-sidebar-header">
                <h2 className="chat-sidebar-title">Conversations</h2>
                <div className="chat-search-wrapper">
                  <Search className="chat-search-icon" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search chats..."
                    className="chat-search-input"
                  />
                </div>
              </div>

              {/* Chats List */}
              <div className="chat-list">
                {loadingChats ? (
                  <div className="chat-loading">
                    <Loader2 className="spinner" size={30} />
                  </div>
                ) : filteredChats.length > 0 ? (
                  filteredChats.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedChat(customer);
                        loadMessages(customer.id);
                      }}
                      className={`chat-item ${
                        selectedChat?.id === customer.id
                          ? "chat-item-active"
                          : ""
                      }`}
                    >
                      <div className="chat-item-avatar">
                        <div className="chat-avatar">
                          {customer.full_name?.charAt(0)}
                        </div>
                        <Circle size={12} className="chat-online-indicator" />
                      </div>
                      <div className="chat-item-info">
                        <div className="chat-item-header">
                          <h3 className="chat-item-name">
                            {customer.full_name}
                          </h3>
                        </div>
                        <p className="chat-item-preview">
                          {customer.last_message || "No messages yet"}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="chat-empty">
                    <MessagesSquare size={50} className="chat-empty-icon" />
                    <h3 className="chat-empty-title">No Conversations</h3>
                    <p className="chat-empty-text">
                      Customer chats will appear here.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CHAT AREA */}
            <div className="chat-area">
              {selectedChat ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-area-header">
                    <div className="chat-contact">
                      <div className="chat-contact-avatar">
                        {selectedChat.full_name?.charAt(0)}
                      </div>
                      <div>
                        <h2 className="chat-contact-name">
                          {selectedChat.full_name}
                        </h2>
                        <p className="chat-contact-status">Online</p>
                      </div>
                    </div>
                    <div className="chat-actions">
                      <button className="chat-action-btn">
                        <Phone size={20} />
                      </button>
                      <button className="chat-action-btn">
                        <Video size={20} />
                      </button>
                      <button className="chat-action-btn">
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="chat-messages">
                    {loadingMessages ? (
                      <div className="chat-loading">
                        <Loader2 className="spinner" size={30} />
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`chat-message ${
                            msg.sender_id === user.id
                              ? "chat-message-sent"
                              : "chat-message-received"
                          }`}
                        >
                          <div className="chat-bubble">
                            <p>{msg.message}</p>
                            <p className="chat-time">
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="chat-no-messages">No messages yet</div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="chat-input-area">
                    <button className="chat-attach-btn">
                      <Paperclip size={22} />
                    </button>
                    <div className="chat-input-wrapper">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="chat-input"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleSend();
                          }
                        }}
                      />
                      <button className="chat-emoji-btn">
                        <Smile size={22} />
                      </button>
                    </div>
                    <button
                      onClick={handleSend}
                      disabled={loading}
                      className="chat-send-btn"
                    >
                      {loading ? (
                        <Loader2 className="spinner" />
                      ) : (
                        <Send size={24} />
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="chat-placeholder">
                  <MessagesSquare size={70} className="chat-placeholder-icon" />
                  <h2 className="chat-placeholder-title">
                    Select Conversation
                  </h2>
                  <p className="chat-placeholder-text">
                    Choose a customer chat to start messaging.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProviderChat;
