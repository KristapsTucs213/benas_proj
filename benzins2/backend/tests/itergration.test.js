const request = require("supertest");
const { app, pool } = require("../server"); 

describe("Fuel Stations API Integration Test", () => {
  it("should fetch all stations with valid prices", async () => {
    const res = await request(app).get("/uzpildes_stacijas");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const stationNames = res.body.map(s => s.tanka_vards.toLowerCase());
    expect(stationNames).toContain("viada");
    expect(stationNames).toContain("circle k");
    expect(stationNames).toContain("neste");

    res.body.forEach(station => {
      expect(station).toHaveProperty("d_cena");
      expect(station).toHaveProperty("supd_cena");
      expect(station).toHaveProperty("95_cena");
      expect(station).toHaveProperty("98_cena");
    });
  });

  it("should fetch a specific station by ID", async () => {
    const res = await request(app).get("/uzpildes_stacijas/1");

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("tanka_vards", "Viada");
    expect(res.body).toHaveProperty("d_cena");
    expect(res.body).toHaveProperty("95_cena");
  });

  afterAll(async () => {
    await pool.end();
  });
});
