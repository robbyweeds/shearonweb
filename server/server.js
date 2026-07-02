// server/server.js
const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");

const app = express();
app.set("trust proxy", true);

// Enable CORS
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// -----------------------------------------------------
// CONNECT TO SQLITE
// -----------------------------------------------------
let db;
try {
  db = new Database("./database.db");
  console.log("Connected to SQLite database.");
} catch (err) {
  console.error("Failed to connect to SQLite:", err.message);
}

// -----------------------------------------------------
// CREATE TABLES
// -----------------------------------------------------
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_name TEXT,
    date TEXT,
    acres REAL
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    project_id INTEGER,
    type TEXT,
    data TEXT,
    FOREIGN KEY(project_id) REFERENCES projects(id)
  );
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS rates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    value REAL,
    category TEXT,
    unit TEXT
  );
`);

// -----------------------------------------------------
// INSERT DEFAULT RATES IF TABLE IS EMPTY
// -----------------------------------------------------
const rateCount = db.prepare(`SELECT COUNT(*) AS c FROM rates`).get().c;

if (rateCount === 0) {
  const defaults = [
    { name: "mower_hourly", value: 65, category: "mowing", unit: "$/hr" },
    { name: "mulching_rate_per_yard", value: 125, category: "mulching", unit: "$/yd" },
    { name: "labor_rate", value: 45, category: "global", unit: "$/hr" },
    { name: "dump_fee", value: 65, category: "leaves", unit: "$" },
    { name: "leaf_rate_per_cubic", value: 275, category: "leaves", unit: "$/cubic" },

    // Your mowing unit prices
    { name: "unit_72", value: 51, category: "mowing", unit: "$" },
    { name: "unit_60", value: 61, category: "mowing", unit: "$" },
    { name: "unit_48", value: 56, category: "mowing", unit: "$" },
    { name: "unit_trimmer", value: 55, category: "mowing", unit: "$/hr" }
  ];

  const insertStmt = db.prepare(`
    INSERT INTO rates (name, value, category, unit)
    VALUES (?, ?, ?, ?)
  `);

  const insertMany = db.transaction((rows) => {
    rows.forEach((r) => insertStmt.run(r.name, r.value, r.category, r.unit));
  });

  insertMany(defaults);

  console.log("Default rates inserted.");
}

// -----------------------------------------------------
// GET LAST N PROJECTS
// -----------------------------------------------------
app.get("/projects", (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const rows = db
      .prepare("SELECT * FROM projects ORDER BY id DESC LIMIT ?")
      .all(limit);

    res.json({ success: true, projects: rows });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// GET SINGLE PROJECT + SERVICES
// -----------------------------------------------------
app.get("/project/:id", (req, res) => {
  try {
    const projectId = req.params.id;

    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(projectId);

    if (!project) {
      return res.json({ success: false, error: "Project not found" });
    }

    const services = db
      .prepare("SELECT type, data FROM services WHERE project_id = ?")
      .all(projectId);

    const parsedServices = {};
    services.forEach((s) => {
      parsedServices[s.type] = JSON.parse(s.data);
    });

    res.json({ success: true, project, services: parsedServices });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// DELETE PROJECT + SERVICES
// -----------------------------------------------------
app.delete("/project/:id", (req, res) => {
  try {
    const projectId = req.params.id;

    db.prepare("DELETE FROM services WHERE project_id = ?").run(projectId);
    db.prepare("DELETE FROM projects WHERE id = ?").run(projectId);

    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// SAVE PROJECT + SERVICES
// -----------------------------------------------------
app.post("/project", (req, res) => {
  try {
    const { project, services } = req.body;
    const { projectName, date, acres } = project;

    // Insert project
    const info = db
      .prepare(
        "INSERT INTO projects (project_name, date, acres) VALUES (?, ?, ?)"
      )
      .run(projectName, date, acres);

    const projectId = info.lastInsertRowid;

    // Insert services
    const insertService = db.prepare(`
      INSERT INTO services (project_id, type, data)
      VALUES (?, ?, ?)
    `);

    const insertMany = db.transaction((objects) => {
      for (const [type, data] of Object.entries(objects)) {
        insertService.run(projectId, type, JSON.stringify(data));
      }
    });

    insertMany(services);

    res.json({ success: true, projectId });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// GET ALL RATES
// -----------------------------------------------------
app.get("/rates", (req, res) => {
  try {
    const rows = db
      .prepare("SELECT name, value, category, unit FROM rates")
      .all();

    res.json({ success: true, rates: rows });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -----------------------------------------------------
// UPDATE RATE BY NAME
// -----------------------------------------------------
app.put("/rates/:name", (req, res) => {
  try {
    const { name } = req.params;
    const { value } = req.body;

    if (typeof value !== "number") {
      return res
        .status(400)
        .json({ success: false, error: "Value must be a number" });
    }

    const result = db
      .prepare("UPDATE rates SET value = ? WHERE name = ?")
      .run(value, name);

    if (result.changes === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Rate not found" });
    }

    res.json({ success: true, updated: result.changes });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// ----------------------------------------
// Mowing Rates
// ----------------------------------------

db.exec(`
  CREATE TABLE IF NOT EXISTS mowing_rates (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    rate_72 REAL DEFAULT 61,
    rate_60 REAL DEFAULT 59,
    rate_48 REAL DEFAULT 56,
    rate_trimmer REAL DEFAULT 55,
    rate_blower REAL DEFAULT 55,
    rate_rotary REAL DEFAULT 100
  );
`);

// Ensure row exists
const existingRates = db.prepare("SELECT * FROM mowing_rates WHERE id = 1").get();
if (!existingRates) {
  db.prepare(`
    INSERT INTO mowing_rates (id) VALUES (1)
  `).run();
}

// GET rates
app.get("/api/mowing-rates", (req, res) => {
  const row = db.prepare("SELECT * FROM mowing_rates WHERE id = 1").get();
  res.json(row);
});

// UPDATE rates
app.put("/api/mowing-rates", (req, res) => {
  const {
    rate_72,
    rate_60,
    rate_48,
    rate_trimmer,
    rate_blower,
    rate_rotary
  } = req.body;

  db.prepare(`
    UPDATE mowing_rates SET
      rate_72 = ?,
      rate_60 = ?,
      rate_48 = ?,
      rate_trimmer = ?,
      rate_blower = ?,
      rate_rotary = ?
    WHERE id = 1
  `).run(
    rate_72,
    rate_60,
    rate_48,
    rate_trimmer,
    rate_blower,
    rate_rotary
  );

  res.json({ message: "Rates updated" });
});



// -----------------------------------------------------
app.listen(5000, () => console.log("Server running on port 5000"));
