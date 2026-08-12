require("dotenv").config();

console.log({
  host: process.env.PG_HOST,
  port: process.env.PG_PORT,
  user: process.env.PG_USER,
  passwordLoaded: !!process.env.PG_PASSWORD,
  database: process.env.PG_DATABASE,
});

const postgres = require("./config/postgres");

(async () => {
  try {
    const result = await postgres.query("SELECT NOW()");
    console.log("PostgreSQL Connected:", result.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error("Connection Error:", err);
    process.exit(1);
  }
})();