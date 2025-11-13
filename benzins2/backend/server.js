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
    user: "degviela_user",   
    password: "123", 
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
        let d_description = "", supd_description = "", description95 = "", description98 = "";

        $("table tr").each((i, row) => {
            const imgSrc = $(row).find("td img").attr("src");
            if (!imgSrc) return;

            let price = $(row).find("td:nth-child(2)").text().trim();
            price = price.replaceAll(/[^\d.,]+/g, "").trim();

            const desc = $(row)
                .find("td:nth-child(3) span.dus-name")
                .map((i, el) => {
                    const name = $(el).text().trim();
                    const address = $(el)[0].nextSibling?.nodeValue?.trim().replace(/^:\s*/, "") || "";
                    return `${name}: ${address}`;
                })
                .get()
                .join(", ");

            if (imgSrc.includes("petrol_d_new.png")) {
                d_cena = price;
                d_description = desc;
            } else if (imgSrc.includes("petrol_d_ecto_new.png")) {
                supd_cena = price;
                supd_description = desc;
            } else if (imgSrc.includes("petrol_95ecto_new.png")) {
                cena95 = price;
                description95 = desc;
            } else if (imgSrc.includes("petrol_98_new.png")) {
                cena98 = price;
                description98 = desc;
            }

        });


        return { d_cena, supd_cena, cena95, cena98, d_description, supd_description, description95, description98 };
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

    const result = await page.evaluate(() => {
      const rows = document.querySelectorAll("table tbody tr");

      const cleanPrice = (price) => price.replaceAll(/[^\d.,]+/g, "").trim();

      const data = {
        d_cena: "N/A",
        supd_cena: "N/A",
        cena95: "N/A",
        cena98: "N/A",
        d_description: "",
        supd_description: "",
        description95: "",
        description98: ""
      };

      rows.forEach(row => {
        const name = row.children[0]?.innerText.trim().toLowerCase();
        const price = cleanPrice(row.children[1]?.innerText.trim());

        const cell = row.children[2];
        let description = "";
        if (cell) {
          const p = cell.querySelector("p");
          description = p ? p.innerText.trim() : cell.innerText.trim();
        }

        if (name === "dmiles") {
          data.d_cena = price;
          data.d_description = description;
        } else if (name.includes("dmiles+")) {
          data.supd_cena = price;
          data.supd_description = description;
        } else if (name.includes("95miles")) {
          data.cena95 = price;
          data.description95 = description;
        } else if (name.includes("98miles+")) {
          data.cena98 = price;
          data.description98 = description;
        }
      });

      return data;
    });

    await browser.close();
    return result;

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
    let d_description = "", supd_description = "", description95 = "", description98 = "";

    const cleanPrice = (price) => price.replaceAll(/[^\d.,]+/g, "").trim();

    $("tbody tr").each((index, row) => {
      const name = $(row).find("td:first-child").text().trim();
      let price = $(row).find("td:nth-child(2)").text().trim();
      price = cleanPrice(price);
      const description = $(row).find("td:nth-child(3)").text().trim();

      if (name.includes("Neste Futura D")) {
        d_cena = price;
        d_description = description;
      } else if (name.includes("Neste Pro Diesel")) {
        supd_cena = price;
        supd_description = description;
      } else if (name.includes("95")) {
        cena95 = price;
        description95 = description;
      } else if (name.includes("Neste Futura 98")) {
        cena98 = price;
        description98 = description;
      }
    });

    return { d_cena, supd_cena, cena95, cena98, d_description, supd_description, description95, description98 };
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

        const { d_cena, supd_cena, cena95, cena98,
                d_description, supd_description, description95, description98 } = station.data;

        if (!d_cena || !supd_cena || !cena95 || !cena98) {
            console.log(`Skipping ${station.name} due to missing price data.`);
            continue;
        }

        await pool.query(
            `INSERT INTO uzpildes_stacijas
            (id, tanka_vards, d_cena, supd_cena, \`95_cena\`, \`98_cena\`,
             d_desc, supd_desc, \`95_desc\`, \`98_desc\`)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                d_cena=VALUES(d_cena),
                supd_cena=VALUES(supd_cena),
                \`95_cena\`=VALUES(\`95_cena\`),
                \`98_cena\`=VALUES(\`98_cena\`),
                d_desc=VALUES(d_desc),
                supd_desc=VALUES(supd_desc),
                \`95_desc\`=VALUES(\`95_desc\`),
                \`98_desc\`=VALUES(\`98_desc\`)`,
            [station.id, station.name, d_cena, supd_cena, cena95, cena98,
             d_description, supd_description, description95, description98]
        );

        await pool.query(
            `INSERT INTO fuel_prices_history
            (id, uzpildes_stacijas_id, d_cena, supd_cena, \`95_cena\`, \`98_cena\`,
             d_desc, supd_desc, \`95_desc\`, \`98_desc\`, timestamps)
             VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
            [station.id, d_cena, supd_cena, cena95, cena98,
             d_description, supd_description, description95, description98]
        );

        console.log(`${station.name} updated.`);
    }
}




app.get("/uzpildes_stacijas/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM uzpildes_stacijas WHERE id = ?", [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: "Station not found" });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error("Error fetching station:", err.message);
    res.status(500).json({ error: "Database error" });
  }
});


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


if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    updateDatabase();
  });
}

module.exports = { app, pool };

