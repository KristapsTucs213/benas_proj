const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect to SQLite database
const db = new sqlite3.Database("./database.sqlite", (err) => {
    if (err) {
        console.error("Error opening database", err.message);
    } else {
        console.log("Connected to SQLite database");
    }
});

// Create a table if it doesn't exist
db.run(
    "CREATE TABLE IF NOT EXISTS uzpildes_stacijas (id INTEGER PRIMARY KEY, tanka_vards TEXT, d_cena float, supd_cena float, devinipieci_cena float, deviniastoni_cena float)"
);

// API routes
app.get("/uzpildes_stacijas", (req, res) => {
    db.all("SELECT * FROM uzpildes_stacijas", [], (err, rows) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

app.post("/uzpildes_stacijas", (req, res) => {
    const { tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena } = req.body;
    db.run(
        "INSERT INTO uzpildes_stacijas (tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena) VALUES (?, ?, ?, ?, ?)",
        [tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
                return;
            }
            res.json({ id: this.lastID, tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena});
        }
    );
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
