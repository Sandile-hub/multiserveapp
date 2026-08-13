const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,

  connectTimeout: 30000,

  ssl: {
    rejectUnauthorized: false,
  },
});

console.log("=================================");
console.log("MYSQL CONFIG");
console.log("=================================");
console.log("HOST:", process.env.DB_HOST);
console.log("PORT:", process.env.DB_PORT);
console.log("USER:", process.env.DB_USER);
console.log("DATABASE:", process.env.DB_NAME);
console.log("SSL: ENABLED");
console.log("=================================");

pool.getConnection()
  .then((connection) => {
    console.log("✅ MYSQL CONNECTION SUCCESSFUL");

    connection.release();
  })
  .catch((error) => {
    console.error("❌ MYSQL CONNECTION FAILED");
    console.error("CODE:", error.code);
    console.error("MESSAGE:", error.message);
  });

module.exports = pool;