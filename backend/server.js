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
const {
  verifyEmailTransporter,
} = require("./services/emailService");
// ========================================
// CORS CONFIGURATION
// ========================================

const allowedOrigins = [
  "http://localhost:5173",
  "https://multiserveapp-theta.vercel.app",
  
  process.env.CLIENT_URL,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests without an Origin header
    // Such as Postman or server-to-server requests
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    console.log("CORS blocked origin:", origin);

    return callback(new Error("Not allowed by CORS"));
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
  ],
};

// ========================================
// SOCKET.IO
// ========================================

const io = new Server(server, {
  cors: corsOptions,

  transports: ["websocket", "polling"],
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
    if (!userId) {
      return;
    }

    onlineUsers[userId] = socket.id;

    socket.join(`user_${userId}`);

    console.log("USER REGISTERED:", userId);
    console.log("ONLINE USERS:", onlineUsers);
  });

  // ====================================
  // SEND NOTIFICATION
  // ====================================

  socket.on("send_notification", (data) => {
    if (!data || !data.userId) {
      return;
    }

    const targetSocket = onlineUsers[data.userId];

    if (targetSocket) {
      io.to(targetSocket).emit("receive_notification", data);
    }
  });

  // ====================================
  // LIVE CHAT
  // ====================================

  socket.on("send_message", (data) => {
    if (!data || !data.receiverId) {
      return;
    }

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

        console.log("USER REMOVED:", userId);

        break;
      }
    }

    console.log("ONLINE USERS:", onlineUsers);
  });
});

// ========================================
// SECURITY
// ========================================

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,

  max: 100,

  message: {
    success: false,
    message: "Too many requests, try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});

// ========================================
// MIDDLEWARE
// ========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// ========================================
// EXPRESS CORS
// ========================================

app.use(cors(corsOptions));

// ========================================
// SECURITY HEADERS
// ========================================

app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

// ========================================
// RATE LIMIT
// ========================================

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
// HEALTH CHECK
// ========================================

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MultiServe server is healthy",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 404 HANDLER
// ========================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ========================================
// GLOBAL ERROR HANDLER
// ========================================

app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);

  // CORS error
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({
      success: false,
      message: "CORS policy blocked this request.",
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

// ========================================
// POSTGRESQL SYNCHRONIZATION
// ========================================

//try {
//  require("./scripts/syncToPostgres");
//  console.log("PostgreSQL synchronization loaded.");
//} catch (error) {
//  console.error(
//    "PostgreSQL synchronization failed to load:",
//    error.message
//  );
//}

// ========================================
// START SERVER
// ========================================

// ========================================
// START SERVER
// ========================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", async () => {
  console.log("====================================");
  console.log("🚀 MultiServe Server Running");
  console.log(`🌍 PORT: ${PORT}`);

  console.log("====================================");

  // ======================================
  // VERIFY GMAIL SMTP
  // ======================================

  await verifyEmailTransporter();
});