const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");

const app = express();
const PORT = 5000;

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



async function scrapeViada() {
    try {
        const { data } = await axios.get("https://www.viada.lv/zemakas-degvielas-cenas/");
        const $ = cheerio.load(data);

        let d_cena = "", supd_cena = "", cena95 = "", cena98 = "";
        const fuelImages = {
            d_cena: "petrol_d_new.png",
            supd_cena: "petrol_d_ecto_new.png",
            cena95: "petrol_95ecto_new.png",
            cena98: "petrol_98_new.png"
        };

        const cleanPrice = (price) => price.replace(/[^\d.,]+/g, "").trim();

        $("table tr").each((i, row) => {
            const imgSrc = $(row).find("td img").attr("src");
            let price = $(row).find("td:nth-child(2)").text().trim();
            if (!imgSrc) return;
            price = cleanPrice(price);

            if (imgSrc.includes(fuelImages.d_cena)) d_cena = price;
            else if (imgSrc.includes(fuelImages.supd_cena)) supd_cena = price;
            else if (imgSrc.includes(fuelImages.cena95)) cena95 = price;
            else if (imgSrc.includes(fuelImages.cena98)) cena98 = price;
        });

        return { d_cena, supd_cena, cena95, cena98 };
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
                cena95: "N/A",
                cena98: "N/A"
            };

            const cleanPrice = (price) => price.replace(/[^\d.,]+/g, "").trim();

            rows.forEach(row => {
                let name = row.children[0]?.innerText.trim().toLowerCase();
                let price = row.children[1]?.innerText.trim();
                price = cleanPrice(price);

                if (name == "dmiles") result.d_cena = price;
                if (name.includes("dmiles+")) result.supd_cena = price;
                if (name.includes("95miles")) result.cena95 = price;
                if (name.includes("98miles+")) result.cena98 = price;
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

        let d_cena = "", supd_cena = "", cena95 = "", cena98 = "";
        const cleanPrice = (price) => price.replace(/[^\d.,]+/g, "").trim();

        $("tbody tr").each((index, row) => {
            let name = $(row).find("td:first-child").text().trim();
            let price = index === 1 ? $(row).find("td:nth-child(2) p").text().trim()
                                   : $(row).find("td:nth-child(2)").text().trim();
            price = cleanPrice(price);

            if (name.includes("Neste Futura D")) d_cena = price;
            else if (name.includes("Neste Pro Diesel")) supd_cena = price;
            else if (index === 1) cena95 = price;
            else if (name.includes("Neste Futura 98")) cena98 = price;
        });

        return { d_cena, supd_cena, cena95, cena98 };
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
        { id: 1, name: "Viada", data: viadaData },
        { id: 2, name: "Circle K", data: circleKData },
        { id: 3, name: "Neste", data: nesteData }
    ];

    for (let station of stations) {
        if (!station.data) continue;
        const { d_cena, supd_cena, cena95, cena98 } = station.data;

        if (!d_cena || !supd_cena || !cena95 || !cena98) {
            console.log(`Skipping ${station.name} due to missing data.`);
            continue;
        }

        
        await pool.query(
            `INSERT INTO uzpildes_stacijas (id, tanka_vards, d_cena, supd_cena, \`95_cena\`, \`98_cena\`)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                d_cena=VALUES(d_cena),
                supd_cena=VALUES(supd_cena),
                \`95_cena\`=VALUES(\`95_cena\`),
                \`98_cena\`=VALUES(\`98_cena\`)`,
            [station.id, station.name, d_cena, supd_cena, cena95, cena98]
        );

        
        await pool.query(
            `INSERT INTO fuel_prices_history (id, uzpildes_stacijas_id, d_cena, supd_cena, \`95_cena\`, \`98_cena\`, timestamps)
             VALUES (NULL, ?, ?, ?, ?, ?, NOW())`,
            [station.id, d_cena, supd_cena, cena95, cena98]
        );

        console.log(`${station.name} updated.`);
    }
}


app.get("/update-prices", async (req, res) => {
    await updateDatabase();
    res.json({ message: "Fuel prices updated successfully" });
});

app.get("/uzpildes_stacijas", async (req, res) => {
    try {
        const [rows] = await pool.query("SELECT * FROM uzpildes_stacijas");
        res.json(rows);
    } catch (err) {
        console.error("Error fetching stations:", err.message);
        res.status(500).json({ error: "Database error" });
    }
});

app.get("/fuel_prices_history/:station_name", async (req, res) => {
  const { station_name } = req.params;
  try {
    const [station] = await pool.query(
      "SELECT id FROM uzpildes_stacijas WHERE LOWER(tanka_vards) = ?",
      [station_name.toLowerCase()]
    );

    if (!station.length) return res.json([]);

    const stationId = station[0].id;
    const [rows] = await pool.query(
      "SELECT d_cena, supd_cena, `95_cena`, `98_cena`, timestamps FROM fuel_prices_history WHERE uzpildes_stacijas_id = ? ORDER BY timestamps ASC",
      [stationId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error fetching fuel history:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});


// -----------------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    updateDatabase(); // Run once at start
});
