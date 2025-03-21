const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

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



async function scrapeViada() {
    try {
        const { data } = await axios.get("https://www.viada.lv/zemakas-degvielas-cenas/");
        const $ = cheerio.load(data);

        let d_cena = "";
        let supd_cena = "";
        let devinipieci_cena = "";
        let deviniastoni_cena = "";

        // Image URLs for different fuel types
        const fuelImages = {
            d_cena: "petrol_d_new.png",  
            supd_cena: "petrol_d_ecto_new.png",  
            devinipieci_cena: "petrol_95ecto_new.png",  
            deviniastoni_cena: "petrol_98_new.png"  
        };

        // Function to clean the price (remove any non-numeric characters like "EUR")
        const cleanPrice = (price) => {
            return price.replace(/[^\d.,]+/g, "").trim();
        };

        // Iterate through all table rows
        $("table tr").each((i, row) => {
            const imgSrc = $(row).find("td img").attr("src"); // Get image source URL
            const priceTd = $(row).find("td:nth-child(2)"); // Get second <td> (middle column with price)
            let price = priceTd.text().trim(); // Extract price text

            if (!imgSrc) return; // Skip rows without an image

            // Clean the price
            price = cleanPrice(price);

            // Assign prices based on image match
            if (imgSrc.includes(fuelImages.d_cena)) {
                d_cena = price;
            } else if (imgSrc.includes(fuelImages.supd_cena)) {
                supd_cena = price;
            } else if (imgSrc.includes(fuelImages.devinipieci_cena)) {
                devinipieci_cena = price;
            } else if (imgSrc.includes(fuelImages.deviniastoni_cena)) {
                deviniastoni_cena = price;
            }
        });

        console.log("Viada Prices:", { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena });

        return { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena };
    } catch (error) {
        console.error("Error scraping Viada:", error.message);
        return null;
    }
}


// Function to scrape Circle K prices
async function scrapeCircleK() {
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        await page.goto("https://www.circlek.lv/degviela-miles/degvielas-cenas", { waitUntil: "load", timeout: 0 });

        // Scraping logic inside page.evaluate()
        const prices = await page.evaluate(() => {
            let rows = document.querySelectorAll("table tbody tr");
            let result = {
                d_cena: "N/A",
                supd_cena: "N/A",
                devinipieci_cena: "N/A",
                deviniastoni_cena: "N/A",
            };

            // Function to clean price (removes non-numeric characters)
            const cleanPrice = (price) => {
                return price.replace(/[^\d.,]+/g, "").trim();
            };

            rows.forEach(row => {
                let nameCell = row.children[0]; // First column (fuel name)
                let priceCell = row.children[1]; // Second column (fuel price)

                if (!nameCell || !priceCell) return; // Skip invalid rows

                let name = nameCell.innerText.trim().toLowerCase();
                let price = priceCell.innerText.trim();

                // Clean the price
                price = cleanPrice(price);

                if (name == "dmiles") result.d_cena = price;
                if (name.includes("dmiles+")) result.supd_cena = price;
                if (name.includes("95miles")) result.devinipieci_cena = price;
                if (name.includes("98miles+")) result.deviniastoni_cena = price;
            });

            return result;
        });

        await browser.close();

        // Log results to verify correctness
        console.log("Circle K Prices:", prices);

        return prices;
    } catch (error) {
        console.error("Error scraping Circle K:", error.message);
        return null;
    }
}


// Function to scrape Neste prices
async function scrapeNeste() {
    try {
        const { data } = await axios.get("https://www.neste.lv/lv/content/degvielas-cenas");
        const $ = cheerio.load(data);

        let d_cena = "";
        let supd_cena = "";
        let devinipieci_cena = "";
        let deviniastoni_cena = "";

        // Select all table rows inside tbody
        const rows = $("tbody tr");

        // Function to clean the price (removes non-numeric characters)
        const cleanPrice = (price) => {
            return price.replace(/[^\d.,]+/g, "").trim();
        };

        rows.each((index, row) => {
            let name = $(row).find("td:first-child").text().trim();  // Fuel name (first column)
            let priceTd = $(row).find("td:nth-child(2)"); // Fuel price (second column)
            let price = priceTd.text().trim(); // Default price extraction

            // Special case for devinipieci_cena (95) → second row, second column, inside <p>
            if (index === 1) {
                price = priceTd.find("p").text().trim();
            }

            // Clean the price
            price = cleanPrice(price);

            // Assign prices based on known names
            if (name.includes("Neste Futura D")) {
                d_cena = price;
            } else if (name.includes("Neste Pro Diesel")) {
                supd_cena = price;
            } else if (index === 1) {  // Specifically second row for devinipieci_cena
                devinipieci_cena = price;
            } else if (name.includes("Neste Futura 98")) {
                deviniastoni_cena = price;
            }
        });

        console.log("Neste Prices:", { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena });

        return { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena };

    } catch (error) {
        console.error("Error scraping Neste:", error.message);
        return null;
    }
}



// Function to update the database
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
            // Log station data before database insertion for debugging
            console.log(`Updating ${station.name}:`, station.data);

            // Ensure that the price values are not empty or undefined
            const { d_cena, supd_cena, devinipieci_cena, deviniastoni_cena } = station.data;

            // Check if any of the price values are not defined
            if (!d_cena || !supd_cena || !devinipieci_cena || !deviniastoni_cena) {
                console.log(`Skipping ${station.name} due to missing price data.`);
                return; // Skip updating if any price is missing
            }

            // Perform the database update with the correct data
            db.run(
                `INSERT INTO uzpildes_stacijas (tanka_vards, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT(tanka_vards) DO UPDATE SET
                d_cena=excluded.d_cena,
                supd_cena=excluded.supd_cena,
                devinipieci_cena=excluded.devinipieci_cena,
                deviniastoni_cena=excluded.deviniastoni_cena;`,
                [station.name, d_cena, supd_cena, devinipieci_cena, deviniastoni_cena],
                (err) => {
                    if (err) {
                        console.error(`Error updating ${station.name}:`, err.message);
                    } else {
                        console.log(`${station.name} fuel prices updated successfully.`);
                    }
                }
            );
        }
    });
}



// API to trigger scraping and update the database
app.get("/update-prices", async (req, res) => {
    await updateDatabase();
    res.json({ message: "Fuel prices updated successfully" });
});

// API to get fuel prices from database
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


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    updateDatabase(); // Update on server start
});
