import { connectionToMongoDB, client, db } from "../src/db/mongoClient";

jest.mock("mongodb", () => {
  const mockDb = {
    databaseName: "Vacation_data",
    command: jest.fn().mockResolvedValue({ ok: 1 }),
  };

  const mockClient = {
    connect: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    db: jest.fn().mockReturnValue(mockDb),
  };

  return {
    MongoClient: jest.fn(() => mockClient),
    Db: jest.fn(),
  };
});

describe("MongoDB Connection", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should connect to MongoDB successfully", async () => {
    await connectionToMongoDB();

    expect(client.connect).toHaveBeenCalledTimes(1);
    expect(client.db).toHaveBeenCalledWith("Vacation_data");
    expect(db.databaseName).toBe("Vacation_data");
  });

  it("should have an active connection", async () => {
    const isConnected = await db.command({ ping: 1 });

    expect(isConnected).toHaveProperty("ok", 1);
    expect(db.command).toHaveBeenCalledWith({ ping: 1 });
  });


});
