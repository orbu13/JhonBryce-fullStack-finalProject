import { Request, Response, NextFunction } from "express";
import verifyUser from "../src/middleware/verifyLogin";

describe("verifyUser Middleware", () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  it("should deny access if the user is not logged in", () => {
    req.headers!["loggedIn"] = "false";

    verifyUser(req as Request, res as Response, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Access denied. User is not login" });
    expect(next).not.toHaveBeenCalled();
  });

  it("should call next if the user is logged in", () => {
    req.headers!["loggedIn"] = "true";
    req.headers!["role"] = "user";

    verifyUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });
});
