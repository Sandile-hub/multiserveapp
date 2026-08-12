require("dotenv").config();

const cron = require("node-cron");
const mysql = require("../config/db");
const postgres = require("../config/postgres");

const TABLES = [
"users",
"businesses",
"services",
"bookings",
"payments",
"reviews",
"notifications",
"favorites",
"provider_availability",
"activities",
"conversations",
"messages",
"platform_settings",
];

let isSyncing = false;

function log(message) {
console.log(`[${new Date().toISOString()}] ${message}`);
}

async function syncTable(tableName) {
let client = null;

try {
log(`Syncing ${tableName}...`);

const [rows] = await mysql.query(
  `SELECT * FROM \`${tableName}\``
);

client = await postgres.connect();

await client.query("BEGIN");

await client.query(
  `TRUNCATE TABLE ${tableName} RESTART IDENTITY CASCADE`
);

if (rows.length > 0) {
  for (const row of rows) {
    const columns = Object.keys(row);
    const values = Object.values(row);

    const placeholders = columns
      .map((_, index) => `$${index + 1}`)
      .join(",");

    const query = `
      INSERT INTO ${tableName}
      (${columns.join(",")})
      VALUES (${placeholders})
    `;

    await client.query(query, values);
  }
}

await client.query("COMMIT");

log(`${tableName}: ${rows.length} rows synced`);


} catch (error) {
if (client) {
try {
await client.query("ROLLBACK");
} catch (rollbackError) {
console.error(
`Rollback failed for ${tableName}:`,
rollbackError.message
);
}
}


console.error(
  `Error syncing ${tableName}:`,
  error.message
);


} finally {
if (client) {
client.release();
}
}
}

async function runSync() {
if (isSyncing) {
log("Previous sync still running. Skipping...");
return;
}

isSyncing = true;

try {
log("====================================");
log("Starting PostgreSQL synchronization");


for (const table of TABLES) {
  await syncTable(table);
}

log("PostgreSQL synchronization completed");
log("====================================");


} catch (error) {
console.error("Synchronization failed:", error);
} finally {
isSyncing = false;
}
}

// Run immediately when service starts
runSync();

// Run every 5 minutes
cron.schedule("*/5 * * * *", async () => {
await runSync();
});

// Graceful shutdown
process.on("SIGINT", async () => {
log("Shutting down sync service...");

try {
await postgres.end();
} catch (err) {
console.error(err);
}

process.exit(0);
});

process.on("SIGTERM", async () => {
log("Termination signal received...");

try {
await postgres.end();
} catch (err) {
console.error(err);
}

process.exit(0);
});

process.on("unhandledRejection", (reason) => {
console.error("Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
console.error("Uncaught Exception:", error);
});
