import request from "supertest";
import express from "express";
import adminRouter from "../src/routes/adminRoutes";
import { db } from "../src/db/mongoClient";

jest.mock("../src/db/mongoClient", () => {
  const mockDb = {
    collection: jest.fn().mockImplementation(() => ({
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    })),
  };
  return { db: mockDb };
});

jest.mock("../src/middleware/verifyAdmin", () =>
  jest.fn((req: express.Request, res: express.Response, next:express.NextFunction) => next())
);

jest.mock("../src/middleware/uploadMiddleware", () =>
  jest.fn(() => (req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.file = {
      fieldname: "image",
      originalname: "test-image.jpg",
      encoding: "7bit",
      mimetype: "image/jpeg",
      size: 1024,
      buffer: Buffer.from(""),
      destination: "uploads/",
      filename: "test-image.jpg",
      path: "uploads/test-image.jpg",
    } as Express.Multer.File; 
    next();
  })
);


const app = express();
app.use(express.json());
app.use("/", adminRouter);

describe("Admin Router Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /vacations", () => {
    it("should fail to return all vacations", async () => {
      (db.collection("vacations").find as jest.Mock).mockReturnValueOnce({
        toArray: jest.fn().mockResolvedValue([{ destination: "Paris", price: 1000 }]),
      });

      const response = await request(app).get("/vacations");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong");
      expect(response.body.data).toEqual(undefined);
    });
  });

  describe("GET /singleVacation/:id", () => {
    it("should fail to return a single vacation", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue({
        destination: "Paris",
        price: 1000,
      });

      const response = await request(app).get("/singleVacation/64d73c047c93a5e3e55e322f");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Vacation not found.");
      expect(response.body.data).toEqual(undefined);
    });

    it("should return 404 if vacation not found", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).get("/singleVacation/64d73c047c93a5e3e55e322f");
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Vacation not found.");
    });
  });

  describe("POST /newVacation", () => {
    it("should fail to create a new vacation", async () => {
      (db.collection("vacations").insertOne as jest.Mock).mockResolvedValue({ acknowledged: true });

      const response = await request(app).post("/newVacation").send({
        vacationCode: "V001",
        destination: "Paris",
        description: "Amazing trip",
        startDate: "2025-01-01",
        endDate: "2025-01-10",
        price: 1000,
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong!");
    });

    it("should handle validation errors", async () => {
      const response = await request(app).post("/newVacation").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed.");
    });
  });

  describe("DELETE /delete-vacation/:id", () => {
    it("should fail to delete vacation", async () => {
      (db.collection("vacations").deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 1 });

      const response = await request(app).delete("/delete-vacation/64d73c047c93a5e3e55e322f");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong!");
    });

    it("should return 500 if vacation not found", async () => {
      (db.collection("vacations").deleteOne as jest.Mock).mockResolvedValue({ deletedCount: 0 });

      const response = await request(app).delete("/delete-vacation/64d73c047c93a5e3e55e322f");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong!");
    });
  });
});
