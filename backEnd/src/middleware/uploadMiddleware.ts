import { Request, Response, NextFunction } from "express";
import multer, { MulterError } from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

interface MulterRequest extends Request {
  file?: Express.Multer.File;
}

function multerMiddleware(isFileRequired: boolean) {
  return function (req: MulterRequest, res: Response, next: NextFunction): void {
    upload.single("image")(req, res, (error: any) => {
      if (error instanceof MulterError) {
        return res.status(400).json({ message: error.message });
      } else if (error) {
        return res.status(500).json({ message: "File upload error.", error: error.message });
      }

      if (isFileRequired && !req.file) {
        return res.status(400).json({ message: "File is required for this request." });
      }

      next();
    });
  };
}

export default multerMiddleware;
