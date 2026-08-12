const mysql = require("./db");
const postgres = require("./postgres");

const DB_ENGINE = process.env.DB_ENGINE || "mysql";

function convertPlaceholders(sql) {
let index = 0;

return sql.replace(/\?/g, () => {
index++;
return `$${index}`;
});
}

async function query(sql, params = []) {
// MYSQL
if (DB_ENGINE === "mysql") {
return await mysql.query(sql, params);
}

// POSTGRESQL
const pgSql = convertPlaceholders(sql);

const command = sql
.trim()
.split(" ")[0]
.toUpperCase();

// ========================
// SELECT
// ========================
if (command === "SELECT") {
const result = await postgres.query(
pgSql,
params
);


return [result.rows];


}

// ========================
// INSERT
// ========================
if (command === "INSERT") {
let insertSql = pgSql;


// Add RETURNING id if not already present
if (
  !insertSql.toUpperCase()
  .includes("RETURNING")
) {
  insertSql += " RETURNING id";
}

const result = await postgres.query(
  insertSql,
  params
);

return [
  {
    insertId:
      result.rows[0]?.id || null,
    affectedRows:
      result.rowCount,
  },
];


}

// ========================
// UPDATE
// ========================
if (command === "UPDATE") {
const result = await postgres.query(
pgSql,
params
);


return [
  {
    affectedRows:
      result.rowCount,
  },
];


}

// ========================
// DELETE
// ========================
if (command === "DELETE") {
const result = await postgres.query(
pgSql,
params
);


return [
  {
    affectedRows:
      result.rowCount,
  },
];


}

// ========================
// OTHER QUERIES
// ========================
const result = await postgres.query(
pgSql,
params
);

return [result.rows];
}

module.exports = {
query,
};
