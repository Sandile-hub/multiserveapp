const mysql = require("mysql2/promise");

// ========================================
// MYSQL PRODUCTION CONNECTION POOL
// ========================================

const pool = mysql.createPool({
  host: process.env.DB_HOST,

  port: Number(process.env.DB_PORT || 3306),

  user: process.env.DB_USER,

  password: process.env.DB_PASSWORD,

  database: process.env.DB_NAME,

  // ======================================
  // CONNECTION POOL
  // ======================================

  waitForConnections: true,

  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 10),

  maxIdle: Number(process.env.DB_MAX_IDLE || 10),

  idleTimeout: Number(process.env.DB_IDLE_TIMEOUT || 60000),

  queueLimit: Number(process.env.DB_QUEUE_LIMIT || 0),

  // ======================================
  // CONNECTION TIMEOUT
  // ======================================

  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 30000),

  // ======================================
  // SSL
  // ======================================

  ssl: {
    rejectUnauthorized: false,
  },

  // ======================================
  // CHARSET
  // ======================================

  charset: "utf8mb4",

  // ======================================
  // DATE HANDLING
  // ======================================

  dateStrings: false,

  // ======================================
  // DEBUG
  // ======================================

  debug: false,

  trace: false,
});

// ========================================
// MYSQL CONFIG LOG
// ========================================

console.log("=================================");
console.log("MYSQL DATABASE CONFIG");
console.log("=================================");
console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT || 3306);
console.log("DATABASE:", process.env.DB_NAME);
console.log("USER:", process.env.DB_USER);
console.log("POOL LIMIT:", process.env.DB_CONNECTION_LIMIT || 10);
console.log("SSL: ENABLED");
console.log("=================================");

// ========================================
// TEST CONNECTION
// ========================================

async function testConnection() {
  let connection;

  try {
    connection = await pool.getConnection();

    await connection.ping();

    console.log("✅ MYSQL CONNECTION SUCCESSFUL");

    return true;
  } catch (error) {
    console.error("❌ MYSQL CONNECTION FAILED");

    console.error("CODE:", error.code);

    console.error("MESSAGE:", error.message);

    return false;
  } finally {
    if (connection) {
      connection.release();
    }
  }
}

// ========================================
// HEALTH CHECK
// ========================================

async function healthCheck() {
  try {
    await pool.query("SELECT 1 AS healthy");

    return {
      healthy: true,
      engine: "mysql",
    };
  } catch (error) {
    console.error("MYSQL HEALTH CHECK FAILED:", error.message);

    return {
      healthy: false,
      engine: "mysql",
      error: error.message,
    };
  }
}

// ========================================
// GRACEFUL SHUTDOWN
// ========================================

async function closePool() {
  try {
    await pool.end();

    console.log("✅ MYSQL CONNECTION POOL CLOSED");
  } catch (error) {
    console.error("❌ ERROR CLOSING MYSQL POOL:", error.message);
  }
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  pool,
  query: pool.query.bind(pool),
  execute: pool.execute.bind(pool),
  getConnection: pool.getConnection.bind(pool),

  testConnection,
  healthCheck,
  closePool,
};
