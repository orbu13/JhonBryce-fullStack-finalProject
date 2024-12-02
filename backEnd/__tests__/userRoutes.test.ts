import request from "supertest";
import express from "express";
import userRouter from "../src/routes/userRoutes";
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

jest.mock("../src/middleware/verifyLogin", () =>
  jest.fn((req: express.Request, res: express.Response, next: express.NextFunction) => {
    req.body.user = { id: "mockUserId" }; 
    next();
  })
);

const app = express();
app.use(express.json());
app.use("/", userRouter);

describe("User Router Tests", () => {
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

    it("should handle database errors", async () => {
      (db.collection("vacations").find as jest.Mock).mockReturnValueOnce({
        toArray: jest.fn().mockRejectedValue(new Error("Database error")),
      });

      const response = await request(app).get("/vacations");
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong");
    });
  });

  describe("POST /register", () => {
    
    it("should handle validation errors", async () => {
      const response = await request(app).post("/register").send({});

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Validation failed");
    });

    it("should handle duplicate email", async () => {
      (db.collection("users").findOne as jest.Mock).mockResolvedValue({ email: "john.doe@example.com" });

      const response = await request(app).post("/register").send({
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "password123",
      });

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Unexpected error");
    });
  });

  describe("POST /follow-vacation/:id", () => {
  
    it("should handle already following", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue({
        _id: "mockVacationId",
        followers: ["mockUserId"],
      });

      const response = await request(app).post("/follow-vacation/mockVacationId");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong!");
    });

    it("should handle vacation not found", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/follow-vacation/mockVacationId");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong!");
    });
  });

  describe("POST /unfollow-vacation/:id", () => {
    it("should fail to successfully unfollow a vacation", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue({
        _id: "mockVacationId",
        followers: ["mockUserId"],
      });

      const response = await request(app).post("/unfollow-vacation/mockVacationId");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong");
    });

    it("should handle not following the vacation", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue({
        _id: "mockVacationId",
        followers: [],
      });

      const response = await request(app).post("/unfollow-vacation/mockVacationId");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong");
    });

    it("should handle vacation not found", async () => {
      (db.collection("vacations").findOne as jest.Mock).mockResolvedValue(null);

      const response = await request(app).post("/unfollow-vacation/mockVacationId");

      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Something went wrong");
    });
  });
});
