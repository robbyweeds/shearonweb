const sqlite3 = require("sqlite3").verbose();

// Create or open database file
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error("Error opening database", err);
  else console.log("SQLite database ready.");
});

// Create tables if they don't exist
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_name TEXT NOT NULL,
      date TEXT NOT NULL,
      acres REAL NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      service_type TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id)
    )
  `);
});

module.exports = db;
