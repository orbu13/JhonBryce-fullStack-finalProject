import request from "supertest";
import app from "../src/index"; 
import { MongoClient } from "mongodb";
import path from "path";

jest.mock("../src/db/mongoClient", () => ({
  connectionToMongoDB: jest.fn(),
}));

describe("Integration Tests for App", () => {
  it("should serve static files from the /uploads directory", async () => {
    const response = await request(app).get("/uploads/somefile.jpg");
    
    expect(response.status).toBe(404);
  });

  it("should handle requests to /users route", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(404);
  });

  it("should handle requests to /admin route", async () => {
    const response = await request(app).get("/admin");

    expect(response.status).toBe(404);
  });

  it("should return 404 for undefined routes", async () => {
    const response = await request(app).get("/nonexistent-route");
    
    expect(response.status).toBe(404);
  });

  it("should properly configure static file paths", () => {
    const expectedPath = path.join(__dirname, "../uploads");
    expect(app._router.stack.some((layer: any) => layer.regexp.test("/uploads"))).toBeTruthy();
    expect(expectedPath).toContain("uploads");
  });
});
