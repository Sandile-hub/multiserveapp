const mysql = require("./db");
const postgres = require("./postgres");

// ========================================
// DATABASE ENGINE
// ========================================

const DB_ENGINE = (process.env.DB_ENGINE || "mysql").toLowerCase();

console.log("=================================");
console.log("DATABASE ENGINE:", DB_ENGINE.toUpperCase());
console.log("=================================");

// ========================================
// VALIDATE DATABASE ENGINE
// ========================================

if (!["mysql", "postgresql", "postgres"].includes(DB_ENGINE)) {
  throw new Error(`Unsupported DB_ENGINE: ${DB_ENGINE}`);
}

// ========================================
// NORMALIZE ENGINE
// ========================================

const ENGINE = DB_ENGINE === "postgres" ? "postgresql" : DB_ENGINE;

// ========================================
// CONVERT MYSQL PLACEHOLDERS
// ? -> $1, $2, $3...
// ========================================

function convertPlaceholders(sql) {
  let index = 0;

  return sql.replace(/\?/g, () => `$${++index}`);
}

// ========================================
// GET COMMAND
// ========================================

function getCommand(sql) {
  return sql.trim().split(/\s+/)[0].toUpperCase();
}

// ========================================
// MYSQL QUERY
// ========================================

async function mysqlQuery(sql, params = []) {
  return await mysql.query(sql, params);
}

// ========================================
// POSTGRES QUERY
// ========================================

async function postgresQuery(sql, params = []) {
  const pgSql = convertPlaceholders(sql);

  const result = await postgres.query(pgSql, params);

  const command = getCommand(sql);

  // ======================================
  // SELECT
  // ======================================

  if (command === "SELECT") {
    return [result.rows, result];
  }

  // ======================================
  // INSERT
  // ======================================

  if (command === "INSERT") {
    return [
      {
        insertId: result.rows[0]?.id || null,

        affectedRows: result.rowCount || 0,

        rows: result.rows,
      },
      result,
    ];
  }

  // ======================================
  // UPDATE
  // ======================================

  if (command === "UPDATE") {
    return [
      {
        affectedRows: result.rowCount || 0,

        rows: result.rows,
      },
      result,
    ];
  }

  // ======================================
  // DELETE
  // ======================================

  if (command === "DELETE") {
    return [
      {
        affectedRows: result.rowCount || 0,

        rows: result.rows,
      },
      result,
    ];
  }

  // ======================================
  // OTHER
  // ======================================

  return [result.rows, result];
}

// ========================================
// MAIN QUERY FUNCTION
// ========================================

async function query(sql, params = []) {
  try {
    if (ENGINE === "mysql") {
      return await mysqlQuery(sql, params);
    }

    return await postgresQuery(sql, params);
  } catch (error) {
    console.error("DATABASE QUERY ERROR");

    console.error("ENGINE:", ENGINE);

    console.error("CODE:", error.code || "N/A");

    console.error("MESSAGE:", error.message);

    throw error;
  }
}

// ========================================
// MYSQL TRANSACTION
// ========================================

async function transaction(callback) {
  if (ENGINE !== "mysql") {
    throw new Error(
      "Transactions through this helper are currently configured for MySQL.",
    );
  }

  let connection;

  try {
    connection = await mysql.getConnection();

    await connection.beginTransaction();

    // ====================================
    // TRANSACTION QUERY HELPER
    // ====================================

    const tx = {
      query: async (sql, params = []) => {
        return await connection.query(sql, params);
      },

      execute: async (sql, params = []) => {
        return await connection.execute(sql, params);
      },
    };

    // ====================================
    // EXECUTE CALLBACK
    // ====================================

    const result = await callback(tx);

    // ====================================
    // COMMIT
    // ====================================

    await connection.commit();

    return result;
  } catch (error) {
    // ====================================
    // ROLLBACK
    // ====================================

    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("ROLLBACK FAILED:", rollbackError.message);
      }
    }

    throw error;
  } finally {
    // ====================================
    // RELEASE CONNECTION
    // ====================================

    if (connection) {
      connection.release();
    }
  }
}

// ========================================
// GET DATABASE CONNECTION
// ========================================

async function getConnection() {
  if (ENGINE === "mysql") {
    return await mysql.getConnection();
  }

  throw new Error("getConnection() is currently implemented for MySQL.");
}

// ========================================
// HEALTH CHECK
// ========================================

async function healthCheck() {
  try {
    if (ENGINE === "mysql") {
      return await mysql.healthCheck();
    }

    await postgres.query("SELECT 1");

    return {
      healthy: true,
      engine: "postgresql",
    };
  } catch (error) {
    return {
      healthy: false,
      engine: ENGINE,
      error: error.message,
    };
  }
}

// ========================================
// CLOSE DATABASE
// ========================================

async function close() {
  if (ENGINE === "mysql") {
    await mysql.closePool();

    return;
  }

  if (typeof postgres.end === "function") {
    await postgres.end();
  }
}

// ========================================
// EXPORT
// ========================================

module.exports = {
  query,

  transaction,

  getConnection,

  healthCheck,

  close,

  engine: ENGINE,
};
