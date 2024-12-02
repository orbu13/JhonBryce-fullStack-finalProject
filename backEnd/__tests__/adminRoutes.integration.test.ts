import request from "supertest";
import express from "express";
import adminRouter from "../src/routes/adminRoutes";
import { connectionToMongoDB } from "../src/db/mongoClient";

beforeAll(async () => {
  await connectionToMongoDB();
});

const app = express();
app.use(express.json());
app.use("/", adminRouter);

describe("Admin Router Integration Tests", () => {
  describe("GET /vacations", () => {
    it("should return all vacations", async () => {
      const response = await request(app).get("/vacations").set({
        loggedIn: "true",
        role: "admin",
      });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Success");
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe("GET /singleVacation/:id", () => {
    it("should return a single vacation", async () => {
      const vacationId = "64d73c047c93a5e3e55e322f"; 
      const response = await request(app).get(`/singleVacation/${vacationId}`).set({
        loggedIn: "true",
        role: "admin",
      });

      if (response.status === 404) {
        expect(response.body.message).toBe("Vacation not found.");
      } else {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Success");
        expect(response.body.data).toBeDefined();
      }
    });
  });

  describe("POST /newVacation", () => {
    it("should create a new vacation", async () => {
      const vacation = {
        vacationCode: "V001",
        destination: "Paris",
        description: "Amazing trip",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
        price: 1000,
      };

      const response = await request(app)
        .post("/newVacation")
        .set({
          loggedIn: "true",
          role: "admin",
        })
        .field("vacationCode", vacation.vacationCode)
        .field("destination", vacation.destination)
        .field("description", vacation.description)
        .field("startDate", vacation.startDate)
        .field("endDate", vacation.endDate)
        .field("price", vacation.price)
        .attach("image", Buffer.from("test-image-content"), "test-image.jpg");

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("Vacation created successfully");
      expect(response.body.data).toBeDefined();
    });

    it("should handle validation errors", async () => {
      const response = await request(app)
        .post("/newVacation")
        .set({
          loggedIn: "true",
          role: "admin",
        })
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("File is required for this request.");
    });
  });

  describe("DELETE /delete-vacation/:id", () => {
    it("should delete a vacation", async () => {
      const vacationId = "64d73c047c93a5e3e55e322f"; 
      const response = await request(app).delete(`/delete-vacation/${vacationId}`).set({
        loggedIn: "true",
        role: "admin",
      });

      if (response.status === 404) {
        expect(response.body.message).toBe("No documents match filter.");
      } else {
        expect(response.status).toBe(200);
        expect(response.body.message).toBe("Successfully deleted one document.");
      }
    });
  });
});
