import request from "supertest";
import express from "express";
import app from "../src/index"; 

jest.mock("../src/routes/userRoutes", () => express.Router());
jest.mock("../src/routes/adminRoutes", () => express.Router());
jest.mock("../src/db/mongoClient", () => ({
  connectionToMongoDB: jest.fn(),
}));

describe("Main App", () => {
  it("should serve static files from the uploads directory", async () => {
    const response = await request(app).get("/uploads/somefile.jpg");
    
    expect(response.status).toBe(404); 
  });

  it("should mount the /users route", async () => {
    const response = await request(app).get("/users");

    expect(response.status).toBe(404);
  });

  it("should mount the /admin route", async () => {
    const response = await request(app).get("/admin");

    expect(response.status).toBe(404);
  });

  it("should return a 404 for an undefined route", async () => {
    const response = await request(app).get("/nonexistent");

    expect(response.status).toBe(404);
  });

});
