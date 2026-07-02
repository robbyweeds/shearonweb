const express = require("express");
const router = express.Router();
const db = require("../database"); // This should export the better-sqlite3 database

router.post("/project", (req, res) => {
  const { project, services } = req.body;

  try {
    // 1️⃣ Insert project
    const projectStmt = db.prepare(`
      INSERT INTO projects (project_name, date, acres)
      VALUES (?, ?, ?)
    `);

    const projectResult = projectStmt.run(
      project.projectName,
      project.date,
      project.acres
    );

    const projectId = projectResult.lastInsertRowid;

    // 2️⃣ Insert services
    const serviceStmt = db.prepare(`
      INSERT INTO services (project_id, service_type, data)
      VALUES (?, ?, ?)
    `);

    for (const service of services) {
      serviceStmt.run(
        projectId,
        service.type,
        JSON.stringify(service.data)
      );
    }

    // 3️⃣ Response
    res.json({
      success: true,
      projectId,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save project" });
  }
});

module.exports = router;
