
const request = require("supertest");
const bcrypt = require("bcrypt");
const app = require("../account_things");


jest.mock("mysql2/promise", () => {
  const mockQuery = jest.fn();
  return {
    createPool: jest.fn(() => ({
      query: mockQuery,
    })),
    __mockQuery: mockQuery,
  };
});

const { __mockQuery } = require("mysql2/promise");

describe("Auth Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  
  it("should register a new user successfully", async () => {
    __mockQuery
      .mockResolvedValueOnce([[]])
      .mockResolvedValueOnce([{}]); 

    const res = await request(app).post("/register").send({
      first_name: "John",
      last_name: "Doe",
      email: "john@example.com",
      password: "12345",
    });

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("User registered successfully");
  });

  it("should not register with existing email", async () => {
    __mockQuery.mockResolvedValueOnce([[{ id: 1 }]]);

    const res = await request(app).post("/register").send({
      first_name: "Jane",
      last_name: "Smith",
      email: "existing@example.com",
      password: "12345",
    });

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toContain("Email already registered");
  });

  it("should reject registration if fields are missing", async () => {
    const res = await request(app).post("/register").send({
      email: "incomplete@example.com",
    });
    expect(res.statusCode).toBe(400);
  });

  it("should login successfully with correct credentials", async () => {
    const hashed = await bcrypt.hash("12345", 10);

    __mockQuery.mockResolvedValueOnce([
      [{ id: 1, email: "john@example.com", password: hashed, first_name: "John", last_name: "Doe" }],
    ]);

    const res = await request(app).post("/login").send({
      email: "john@example.com",
      password: "12345",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe("john@example.com");
    expect(res.body.message).toBe("Login successful");
  });

  it("should reject login with wrong password", async () => {
    const hashed = await bcrypt.hash("correctpass", 10);

    __mockQuery.mockResolvedValueOnce([
      [{ id: 1, email: "john@example.com", password: hashed }],
    ]);

    const res = await request(app).post("/login").send({
      email: "john@example.com",
      password: "wrongpass",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain("Invalid email or password");
  });

  it("should reject login if email does not exist", async () => {
    __mockQuery.mockResolvedValueOnce([[]]);

    const res = await request(app).post("/login").send({
      email: "notfound@example.com",
      password: "12345",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toContain("Invalid email or password");
  });
});
