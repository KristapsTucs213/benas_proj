const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 5000;

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

// Create current prices table
db.run(`
    CREATE TABLE IF NOT EXISTS uzpildes_stacijas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tanka_vards TEXT UNIQUE,
        d_cena FLOAT,
        supd_cena FLOAT,
        devinipieci_cena FLOAT,
        deviniastoni_cena FLOAT
    );
`);

// Create historical prices table
db.run(`
    CREATE TABLE IF NOT EXISTS fuel_prices_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tanka_vards TEXT,
        d_cena FLOAT,
        supd_cena FLOAT,
        devinipieci_cena FLOAT,
        deviniastoni_cena FLOAT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
    );
`, (err) => {
    if (err) {
        console.error("Failed to create fuel_prices_history table:", err.message);
    } else {
        console.log("fuel_prices_history table ensured.");
    }
});


async function scrapeViada() {
    try {
        const { data } = await axios.get("https://www.viada.lv/zemakas-degvielas-cenas/");
        const $ = cheerio.load(data);

        let d_cena = "", supd_cena = "", devinipieci_cena = "", deviniastoni_cena = "";
        const fuelImages = {
            d_cena: "petrol_d_new.png",
            supd_cena: "petrol_d_ecto_new.png",
            devinipieci_cena: "petrol_95ecto_new.png",
            deviniastoni_cena: "petrol_98_new.png"
        };

        const cleanPrice = (price) => price.replace(/[^\d.,]+/g, "").trim();

        $("table tr").each((i, row) => {
            const imgSrc = $(row).find("td img").attr("src");
            const priceTd = $(row).find("td:nth-child(2)");
            let price = priceTd.text().trim();
            if (!imgSrc) return;
            price = cleanPrice(price);

            if (imgSrc.includes(fuelImages.d_cena)) d_cena = price;
            else if (imgSrc.includes(fuelImages.supd_cena)) supd_cena = price;
            else if (imgSrc.includes(fuelImages.devinipieci_cena)) devinipieci_cena = price;
            else if (imgSrc.includes(fuelImages.deviniastoni_cena)) deviniastoni_cena = price;
        });

        return { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena };
    } catch (error) {
        console.error("Error scraping Viada:", error.message);
        return null;
    }
}

async function scrapeCircleK() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto("https://www.circlek.lv/degviela-miles/degvielas-cenas", { waitUntil: "load", timeout: 0 });

        const prices = await page.evaluate(() => {
            let rows = document.querySelectorAll("table tbody tr");
            let result = {
                d_cena: "N/A",
                supd_cena: "N/A",
                devinipieci_cena: "N/A",
                deviniastoni_cena: "N/A"
            };

            const cleanPrice = (price) => price.replace(/[^\d.,]+/g, "").trim();

            rows.forEach(row => {
                let name = row.children[0]?.innerText.trim().toLowerCase();
                let price = row.children[1]?.innerText.trim();
                price = cleanPrice(price);

                if (name == "dmiles") result.d_cena = price;
                if (name.includes("dmiles+")) result.supd_cena = price;
                if (name.includes("95miles")) result.devinipieci_cena = price;
                if (name.includes("98miles+")) result.deviniastoni_cena = price;
            });

            return result;
        });

        await browser.close();
        return prices;
    } catch (error) {
        console.error("Error scraping Circle K:", error.message);
        return null;
    }
}

async function scrapeNeste() {
    try {
        const { data } = await axios.get("https://www.neste.lv/lv/content/degvielas-cenas");
        const $ = cheerio.load(data);

        let d_cena = "", supd_cena = "", devinipieci_cena = "", deviniastoni_cena = "";
        const cleanPrice = (price) => price.replace(/[^\d.,]+/g, "").trim();

        $("tbody tr").each((index, row) => {
            let name = $(row).find("td:first-child").text().trim();
            let priceTd = $(row).find("td:nth-child(2)");
            let price = index === 1 ? priceTd.find("p").text().trim() : priceTd.text().trim();
            price = cleanPrice(price);

            if (name.includes("Neste Futura D")) d_cena = price;
            else if (name.includes("Neste Pro Diesel")) supd_cena = price;
            else if (index === 1) devinipieci_cena = price;
            else if (name.includes("Neste Futura 98")) deviniastoni_cena = price;
        });

        return { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena };
    } catch (error) {
        console.error("Error scraping Neste:", error.message);
        return null;
    }
}

async function updateDatabase() {
    const viadaData = await scrapeViada();
    const circleKData = await scrapeCircleK();
    const nesteData = await scrapeNeste();

    const stations = [
        { name: "Viada", data: viadaData },
        { name: "Circle K", data: circleKData },
        { name: "Neste", data: nesteData }
    ];

    stations.forEach(station => {
        if (station.data) {
            const { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena } = station.data;
            if (!d_cena || !supd_cena || !devinipieci_cena || !deviniastoni_cena) {
                console.log(`Skipping ${station.name} due to missing data.`);
                return;
            }

            // Update latest price table
            db.run(
                `INSERT INTO uzpildes_stacijas (tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena)
                 VALUES (?, ?, ?, ?, ?)
                 ON CONFLICT(tanka_vards) DO UPDATE SET
                    d_cena=excluded.d_cena,
                    supd_cena=excluded.supd_cena,
                    devinipieci_cena=excluded.devinipieci_cena,
                    deviniastoni_cena=excluded.deviniastoni_cena`,
                [station.name, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena],
                (err) => {
                    if (err) console.error(`Error updating ${station.name}:`, err.message);
                    else console.log(`${station.name} current prices updated.`);
                }
            );

            // Insert into history table
            db.run(
                `INSERT INTO fuel_prices_history (tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena)
                 VALUES (?, ?, ?, ?, ?)`,
                [station.name, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena],
                (err) => {
                    if (err) console.error(`Error inserting history for ${station.name}:`, err.message);
                    else console.log(`${station.name} history added.`);
                }
            );
        }
    });
}

// Routes
app.get("/update-prices", async (req, res) => {
    await updateDatabase();
    res.json({ message: "Fuel prices updated successfully" });
});

app.get("/uzpildes_stacijas", (req, res) => {
    db.all("SELECT * FROM uzpildes_stacijas", [], (err, rows) => {
        if (err) {
            console.error("Error fetching stations:", err.message);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(rows);
        }
    });
});

app.get("/fuel-history", (req, res) => {
    db.all("SELECT * FROM fuel_prices_history ORDER BY timestamp ASC", [], (err, rows) => {
        if (err) {
            console.error("Error fetching history:", err.message);
            res.status(500).json({ error: "Database error" });
        } else {
            res.json(rows);
        }
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    updateDatabase(); // Run scrape once at start
});
