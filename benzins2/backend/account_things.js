const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const bcrypt = require("bcrypt"); // 👈 add bcrypt

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());


const pool = mysql.createPool({
    host: "localhost",
    user: "benzins",   
    password: "Esilohs123", 
    database: "degviela",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});


app.post("/register", async (req, res) => {
    try {
        const { first_name, last_name, email, password } = req.body;

        if (!first_name || !last_name || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        
        const [existing] = await pool.query(
            "SELECT id FROM account WHERE email = ?",
            [email]
        );

        if (existing.length > 0) {
            return res
                .status(409)
                .json({ error: "Email already registered. Please use another email." });
        }

        
        const hashedPassword = await bcrypt.hash(password, 10);

        
        await pool.query(
            "INSERT INTO account (first_name, last_name, email, password) VALUES (?, ?, ?, ?)",
            [first_name, last_name, email, hashedPassword]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error registering user:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});


app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email and password are required" });
        }

        
        const [rows] = await pool.query(
            "SELECT * FROM account WHERE email = ?",
            [email]
        );

        if (rows.length === 0) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const user = rows[0];

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        res.status(200).json({
            message: "Login successful",
            user: {
                id: user.id,
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
            },
        });
    } catch (err) {
        console.error("Error logging in:", err.message);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/spending/:account_id", async (req, res) => {
  const { account_id } = req.params;
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.total_spent, s.liters, u.tanka_vards 
       FROM spending_history s
       JOIN uzpildes_stacijas u ON s.uzpildes_stacijas_id = u.id
       WHERE s.account_id = ?`,
      [account_id]
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching spending history:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/spending", async (req, res) => {
  const { account_id, uzpildes_stacijas_id, total_spent, liters } = req.body;
  try {
    await pool.query(
      "INSERT INTO spending_history (account_id, uzpildes_stacijas_id, total_spent, liters) VALUES (?, ?, ?, ?)",
      [account_id, uzpildes_stacijas_id, total_spent, liters]
    );
    res.status(201).json({ message: "Spending record added successfully" });
  } catch (err) {
    console.error("Error adding spending:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});


app.put("/account/:id", async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, email } = req.body;

  if (!first_name || !last_name || !email) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    
    const [existing] = await pool.query(
      "SELECT id FROM account WHERE email = ? AND id != ?",
      [email, id]
    );

    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already in use by another account." });
    }

    
    await pool.query(
      "UPDATE account SET first_name = ?, last_name = ?, email = ? WHERE id = ?",
      [first_name, last_name, email, id]
    );

    res.status(200).json({ message: "Account information updated successfully" });
  } catch (err) {
    console.error("Error updating account info:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
