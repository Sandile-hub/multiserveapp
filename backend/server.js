const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cookieParser = require("cookie-parser");

const http = require("http");

const { Server } = require("socket.io");

dotenv.config();

const app = express();

// ========================================
// HTTP SERVER
// ========================================

const server = http.createServer(app);

// ========================================
// SOCKET.IO
// ========================================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",

    credentials: true,

    methods: ["GET", "POST"],
  },
});

global.io = io;

// ========================================
// STORE ONLINE USERS
// ========================================

const onlineUsers = {};

// ========================================
// SOCKET CONNECTION
// ========================================

io.on("connection", (socket) => {
  console.log("USER CONNECTED:", socket.id);

  // ====================================
  // REGISTER USER
  // ====================================

  socket.on("register_user", (userId) => {
    onlineUsers[userId] = socket.id;

    socket.join(`user_${userId}`);

    console.log("ONLINE USERS:", onlineUsers);
  });

  // ====================================
  // SEND NOTIFICATION
  // ====================================

  socket.on("send_notification", (data) => {
    const targetSocket = onlineUsers[data.userId];

    if (targetSocket) {
      io.to(targetSocket).emit("receive_notification", data);
    }
  });

  // ====================================
  // LIVE CHAT
  // ====================================

  socket.on("send_message", (data) => {
    const targetSocket = onlineUsers[data.receiverId];

    if (targetSocket) {
      io.to(targetSocket).emit("receive_message", data);
    }
  });

  // ====================================
  // DISCONNECT
  // ====================================

  socket.on("disconnect", () => {
    console.log("USER DISCONNECTED:", socket.id);

    for (const userId in onlineUsers) {
      if (onlineUsers[userId] === socket.id) {
        delete onlineUsers[userId];

        break;
      }
    }
  });
});

// ========================================
// SECURITY
// ========================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: "Too many requests, try again later.",
});

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(cookieParser());

app.use(
  cors({
    origin: "http://localhost:5173",

    credentials: true,

    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
);

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(limiter);

// ========================================
// ROUTES
// ========================================

const authRoutes = require("./routes/authRoutes");

const businessRoutes = require("./routes/businessRoutes");

const serviceRoutes = require("./routes/serviceRoutes");

const bookingRoutes = require("./routes/bookingRoutes");

const paymentRoutes = require("./routes/paymentRoutes");

const notificationRoutes = require("./routes/notificationRoutes");

const reviewRoutes = require("./routes/reviewRoutes");

const availabilityRoutes = require("./routes/availabilityRoutes");

const favoriteRoutes = require("./routes/favoriteRoutes");

const analyticsRoutes = require("./routes/analyticsRoutes");

const adminRoutes = require("./routes/adminRoutes");

const chatRoutes = require("./routes/chatRoutes");

const userRoutes = require("./routes/userRoutes");

const customerRoutes = require("./routes/customerRoutes");

const walletRoutes = require("./routes/walletRoutes");

// ========================================
// API ROUTES
// ========================================

app.use("/api/auth", authRoutes);

app.use("/api/business", businessRoutes);

app.use("/api/services", serviceRoutes);

app.use("/api/bookings", bookingRoutes);

app.use("/api/payments", paymentRoutes);

app.use("/api/notifications", notificationRoutes);

app.use("/api/reviews", reviewRoutes);

app.use("/api/availability", availabilityRoutes);

app.use("/api/favorites", favoriteRoutes);

app.use("/api/analytics", analyticsRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/messages", chatRoutes);

app.use("/api/users", userRoutes);

app.use("/api/customers", customerRoutes);

app.use("/api/wallet", walletRoutes);

// ========================================
// ROOT ROUTE
// ========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,

    message: "MultiServe API Running",
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.log("SERVER ERROR:", err);

  res.status(500).json({
    success: false,

    message: err.message || "Internal Server Error",
  });
});

// ========================================
// START SERVER
// ========================================
require("./scripts/syncToPostgres");
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
======================================
🚀 MultiServe Server Running
🌍 PORT: ${PORT}
======================================
  `);
});
