import { useEffect, useMemo, useRef, useState } from "react";
import io from "socket.io-client";
import API from "../../api/axios";
import CustomerSidebar from "../../components/customer/CustomerSidebar";
import CustomerNavbar from "../../components/customer/CustomerNavbar";
import {
  Send,
  Search,
  Sparkles,
  Phone,
  Video,
  MoreVertical,
  Image,
  Smile,
  CheckCheck,
  Circle,
  Loader2,
  MessageSquare,
  Clock3,
} from "lucide-react";
import "../../styles/Customer.css";

const socket = io(
  import.meta.env.VITE_SOCKET_URL
);

function CustomerChat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeChat, setActiveChat] = useState(null);
  const bottomRef = useRef(null);

  // FETCH CONVERSATIONS
  const fetchConversations = async () => {
    try {
      const res = await API.get("/messages/conversations");
      setConversations(res.data || []);
    if (
      res.data?.length > 0 &&
      !activeChat
    ) {
      setActiveChat(res.data[0]);
      fetchMessages(res.data[0].id);
    }
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  // FETCH MESSAGES
  const fetchMessages = async (conversation_id) => {
    try {
      const res = await API.get(`/messages/${conversation_id}`);
      setMessages(res.data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // SOCKET LISTENER
  useEffect(() => {
    socket.on("receive_message", (data) => {
      // Active chat only
      if (data.conversation_id === activeChat?.id) {
          setMessages((prev) => {

            const exists =
            prev.some(
              (msg) => msg.id === data.id
            );

            if (exists) return prev;

            return [...prev, data];
          });
      }
      // Update conversations list
      setConversations((prev) =>
        prev.map((chat) =>
          chat.id === data.conversation_id
            ? {
                ...chat,
                last_message: data.message,
                last_time: data.created_at,
              }
            : chat,
        ),
      );
    });
    return () => {
      socket.off("receive_message");
    };
  }, [activeChat]);

  // AUTO SCROLL
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = async () => {
    if (!message.trim() || !activeChat) return;

    try {
      const data = {
        conversation_id: activeChat.id,
        receiver_id: activeChat.provider_id,
        message,
      };
      const res = await API.post("/messages/send", data);
      socket.emit("send_message", res.data);
      setMessages((prev) => [...prev, res.data]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // FILTERED CONVERSATIONS
  const filteredConversations = useMemo(() => {
    return conversations.filter(
      (chat) =>
        chat.provider_name?.toLowerCase().includes(search.toLowerCase()) ||
        chat.business_name?.toLowerCase().includes(search.toLowerCase()),
    );
  }, [conversations, search]);

  // ONLINE COUNT
  const onlineCount = useMemo(() => {
    return conversations.filter((c) => c.online).length;
  }, [conversations]);

  // LOADING
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 size={55} className="spinner text-cyan" />
          <p className="loading-text">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <CustomerSidebar
  isOpen={sidebarOpen}
  onClose={() => setSidebarOpen(false)}
/>

      <div className="customer-main">
        <CustomerNavbar
  toggleSidebar={() =>
    setSidebarOpen((previous) => !previous)
  }
/>

        <div className="chat-page-container">
          {/* HEADER */}
          <div className="chat-header">
            <div>
              <div className="chat-header-badge">
                <Sparkles size={16} />
                Real-time Messaging
              </div>
              <h1 className="chat-header-title">Messages</h1>
              <p className="chat-header-subtitle">
                Chat directly with service providers.
              </p>
            </div>

            {/* STATS */}
            <div className="chat-stats">
              <div className="chat-stat-card">
                <p className="chat-stat-label">Conversations</p>
                <h2 className="chat-stat-value">{conversations.length}</h2>
              </div>
              <div className="chat-stat-card">
                <p className="chat-stat-label">Online</p>
                <h2 className="chat-stat-value online">{onlineCount}</h2>
              </div>
            </div>
          </div>

          {/* CHAT CONTAINER */}
          <div className="chat-container">
            {/* LEFT SIDEBAR - CONVERSATIONS LIST */}
            <div className="chat-sidebar">
              {/* Search */}
              <div className="chat-sidebar-search">
                <div className="chat-search-wrapper">
                  <Search size={20} className="chat-search-icon" />
                  <input
                    type="text"
                    placeholder="Search chats..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="chat-search-input"
                  />
                </div>
              </div>

              {/* Conversations List */}
              <div className="chat-conversations-list">
                {filteredConversations.map((chat) => (
                  <button
                    key={chat.id}
                    onClick={() => {
                      setActiveChat(chat);
                      fetchMessages(chat.id);
                    }}
                    className={`chat-conversation-item ${
                      activeChat?.id === chat.id
                        ? "chat-conversation-active"
                        : ""
                    }`}
                  >
                    <div className="chat-conversation-avatar">
                      <div className="chat-avatar">
                        {chat.provider_name?.charAt(0)}
                      </div>
                      <div
                        className={`chat-online-indicator ${chat.online ? "chat-online" : "chat-offline"}`}
                      />
                    </div>
                    <div className="chat-conversation-info">
                      <div className="chat-conversation-header">
                        <h3 className="chat-conversation-name">
                          {chat.provider_name}
                        </h3>
                        <span className="chat-conversation-time">
                          {chat.last_time
                            ? new Date(chat.last_time).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : ""}
                        </span>
                      </div>
                      <p className="chat-conversation-business">
                        {chat.business_name}
                      </p>
                      <p className="chat-conversation-last-msg">
                        {chat.last_message}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT - CHAT AREA */}
            <div className="chat-area">
              {activeChat ? (
                <>
                  {/* Chat Header */}
                  <div className="chat-area-header">
                    <div className="chat-contact">
                      <div className="chat-contact-avatar-wrapper">
                        <div className="chat-contact-avatar">
                          {activeChat.provider_name?.charAt(0)}
                        </div>
                        <Circle
                          size={14}
                          fill="currentColor"
                          className={`chat-contact-status ${
                            activeChat.online
                              ? "chat-status-online"
                              : "chat-status-offline"
                          }`}
                        />
                      </div>
                      <div>
                        <h2 className="chat-contact-name">
                          {activeChat.provider_name}
                        </h2>
                        <p className="chat-contact-business">
                          {activeChat.business_name}
                        </p>
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

                  {/* Messages Area */}
                  <div className="chat-messages-area">
                    {messages.length === 0 ? (
                      <div className="chat-empty-state">
                        <div className="chat-empty-icon">
                          <MessageSquare size={50} />
                        </div>
                        <h2 className="chat-empty-title">No Messages Yet</h2>
                        <p className="chat-empty-text">
                          Start chatting with this provider.
                        </p>
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div
                          key={index}
                          className={`chat-message ${
                            msg.sender_id === user?.id
                              ? "chat-message-sent"
                              : "chat-message-received"
                          }`}
                        >
                          <div className="chat-bubble">
                            <p className="chat-bubble-text">{msg.message}</p>
                            <div className="chat-bubble-footer">
                              <Clock3 size={12} />
                              <span>
                                {new Date(msg.created_at).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                              {msg.sender_id === user?.id && (
                                <CheckCheck size={14} />
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={bottomRef} />
                  </div>

                  {/* Message Input */}
                  <div className="chat-input-area">
                    <button className="chat-attach-btn">
                      <Image size={20} />
                    </button>
                    <div className="chat-input-wrapper">
                      <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") sendMessage();
                        }}
                        placeholder="Type your message..."
                        className="chat-input"
                      />
                      <button className="chat-emoji-btn">
                        <Smile size={20} />
                      </button>
                    </div>
                    <button onClick={sendMessage} className="chat-send-btn">
                      <Send size={22} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="chat-no-selected">
                  <MessageSquare size={70} className="chat-no-selected-icon" />
                  <h2 className="chat-no-selected-title">
                    Select a Conversation
                  </h2>
                  <p className="chat-no-selected-text">
                    Choose a chat to start messaging.
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

export default CustomerChat;
