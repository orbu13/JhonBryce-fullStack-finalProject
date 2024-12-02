import express, { Request, Response } from "express";
import request from "supertest";
import multerMiddleware from "../src/middleware/uploadMiddleware";

describe("Multer Middleware", () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.post(
      "/upload",
      multerMiddleware(true),
      (req: Request, res: Response) => {
        res.status(200).json({ message: "File uploaded successfully." });
      }
    );

    app.post(
      "/optional-upload",
      multerMiddleware(false),
      (req: Request, res: Response) => {
        res.status(200).json({ message: "Optional file handling successful." });
      }
    );
  });

  it("should upload a file successfully", async () => {
    const response = await request(app)
      .post("/upload")
      .attach("image", Buffer.from("test file content"), "test-file.txt");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("File uploaded successfully.");
  });

  it("should fail when a file is required but not provided", async () => {
    const response = await request(app).post("/upload");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("File is required for this request.");
  });

  it("should handle optional file upload", async () => {
    const response = await request(app).post("/optional-upload");

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Optional file handling successful.");
  });

  it("should reject files exceeding the size limit", async () => {
    const largeFile = Buffer.alloc(6 * 1024 * 1024); 
    const response = await request(app)
      .post("/upload")
      .attach("image", largeFile, "large-file.txt");

    expect(response.status).toBe(400);
    expect(response.body.message).toContain("File too large");
  });

});
