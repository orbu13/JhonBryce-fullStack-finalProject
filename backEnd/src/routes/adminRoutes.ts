import  {NextFunction, Request, Response, Router} from "express"
import { z} from 'zod'
import verifyAdmin from "../middleware/verifyAdmin"
import {  db } from "../db/mongoClient"
import multerMiddleware from "../middleware/uploadMiddleware"
import { ObjectId } from "mongodb"
import fs from "fs";
import path from "path";
type mongoId = ObjectId

const adminRouter = Router()

adminRouter.get('/vacations', verifyAdmin, async(req:Request, res:Response, next:NextFunction): Promise<any>=>{
    try {
            const vacation = await db.collection('vacations').find().toArray()
            return res.json({message: 'Success', data: vacation})
    } catch (error:any) {
        return res.status(500).json({message: 'Something went wrong', error: error.message})
    }
})

adminRouter.get('/singleVacation/:id', verifyAdmin, async(req:Request, res:Response, next:NextFunction): Promise<any>=>{
  try {
    const id: mongoId = new ObjectId(req.params.id)
    if(!ObjectId.isValid(req.params.id)){
      return res.status(400).json({message: 'Invalid id.'})
    }
      const vacation = await db.collection('vacations').findOne({_id: id})
      if(!vacation){
        return res.status(404).json({message: 'Vacation not found.'})
      }
      return res.json({message: 'Success', data: vacation})
    
  } catch (error:any) {
    return res.status(500).json({message: 'Something went wrong', error: error.message})
  }
})

adminRouter.get("/reports", verifyAdmin, async (req, res): Promise<any> => {
  try {
    const vacations = await db.collection("vacations").find().toArray();
    const reports = vacations.map((vacation) => ({
      destination: vacation.destination,
      followers: vacation.followers || [],
      startDate: vacation.startDate,
      endDate: vacation.endDate,
    }));
  return  res.status(200).json(reports);
  } catch (error) {
   return res.status(500).json({ message: "Failed to fetch reports" });
  }
});


adminRouter.post('/login', async(req:Request, res:Response, next:NextFunction): Promise<any>=>{
    try {
        const {email, password} = req.body
        const foundUser = await db.collection('users').findOne({email: email, password: password})
        if(foundUser === null){
            return res.status(400).json({message: 'Email or password is incorrect.'})
        }
        if(foundUser.role != "admin"){
            return res.status(403).json({message: 'Access denied.'})
        }
        foundUser.loggedIn = true
        foundUser.loggedInDate = new Date()
        await db.collection('users').updateOne({email: foundUser.email}, {$set:{loggedIn: true, loggedInDate: foundUser.loggedInDate}})
        return res.json({message: 'Successful login.', user: foundUser})
    } catch (error:any) {
        return res.json({message: ' Something went wrong!', error: error.message})
    }
})

adminRouter.post('/logout', verifyAdmin, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const { email } = req.body;
        const foundUser = await db.collection('users').findOne({ email: email });

        if (foundUser === null) {
            return res.status(404).json({ message: 'User not found.' });
        }

       const logOutResult = await db.collection('users').updateOne(
            { email: foundUser.email },
            { $set: { loggedIn: false,loggedInDate:null} }
        );
       
        return res.json({ message: 'Successfully logged out.' });
    } catch (error: any) {
        return res.status(500).json({ message: 'Something went wrong!', error: error.message });
    }
});

adminRouter.post('/newVacation', verifyAdmin, multerMiddleware(true), async(req:Request, res:Response, next:NextFunction): Promise<any>=>{
     try {
      const vacationSchema = z
        .object({
          vacationCode: z
            .string()
            .nonempty("Vacation code is required")
            .max(50, "Vacation code must be less than 50 characters"),
          destination: z
            .string()
            .nonempty("Vacation destination is required")
            .max(100, "Destination must be less than 100 characters"),
          description: z
            .string()
            .max(500, "Description must be less than 500 characters")
            .optional(),
          startDate: z.preprocess(
            (arg) =>
              typeof arg === "string" || arg instanceof Date
                ? new Date(arg)
                : null,
            z.date().refine((date) => date > new Date(), {
              message: "Start date must be later than the current date",
            })
          ),
          endDate: z.preprocess(
            (arg) =>
              typeof arg === "string" || arg instanceof Date
                ? new Date(arg)
                : null,
            z.date()
          ),
          price: z
            .number()
            .min(0, "Price must be at least 0")
            .max(10000, "Price must be less than or equal to 10,000"),
          image: z
            .any()
            .refine(
              (file) =>
                file && file.size <= 5 * 1024 * 1024, 
              {
                message: "File size must be less than 5MB",
              }
            )
            .refine(
              (file) =>
                file &&
                ["image/jpeg", "image/png", "image/jpg","image/webp"].includes(file.mimetype), 
              {
                message: "Only JPEG, webp or PNG files are allowed",
              }
            ),
        })
        .refine((data) => data.endDate > data.startDate, {
          message: "End date must be later than start date",
          path: ["endDate"],
        });

      const { file, body } = req;

      if (!file) {
        return res.status(400).json({ message: "Image is required" });
      }

      const vacationsData = {
        vacationCode: body.vacationCode,
        destination: body.destination,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        price: parseFloat(body.price),
        followers: [],
        image: file,
      };

      const validationResult = vacationSchema.safeParse(vacationsData);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed.",
          error: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      body.image = file.filename;

      const existingVacation = await db.collection("vacations").findOne({
        destination: body.destination,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
      });

      if (existingVacation) {
        return res
          .status(409)
          .json({
            message: "A vacation with the same destination and date already exists.",
          });
      }

      const result = await db.collection("vacations").insertOne({...body,followers: []});
      if (result.acknowledged) {
        return res.status(201).json({
          message: "Vacation created successfully",
          data: validationResult.data,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Couldn't create vacation. Try again." });
      }
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Something went wrong!", error: error.message });
    }
})


adminRouter.put(
  '/updateVacation/:id',
  verifyAdmin,
  multerMiddleware(false),
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const vacationSchema = z
        .object({
          vacationCode: z
            .string()
            .nonempty("Vacation code is required")
            .max(50, "Vacation code must be less than 50 characters"),
          destination: z
            .string()
            .nonempty("Vacation destination is required")
            .max(100, "Destination must be less than 100 characters"),
          description: z
            .string()
            .max(500, "Description must be less than 500 characters")
            .optional(),
          startDate: z.preprocess(
            (arg) =>
              typeof arg === "string" || arg instanceof Date ? new Date(arg) : null,
            z.date().refine((date) => date > new Date(), {
              message: "Start date must be later than the current date",
            })
          ),
          endDate: z.preprocess(
            (arg) =>
              typeof arg === "string" || arg instanceof Date ? new Date(arg) : null,
            z.date()
          ),
          price: z
            .preprocess((arg) => parseFloat(arg as string), z.number().min(0).max(10000)),
        })
        .superRefine((data, ctx) => {
          if (data.startDate && data.endDate && data.endDate <= data.startDate) {
            ctx.addIssue({
              code: "custom",
              path: ["endDate"],
              message: "End date must be later than start date",
            });
          }
        });

      const vacationId = req.params.id;
      const existingVacation = await db.collection("vacations").findOne({ _id: new ObjectId(vacationId) });

      if (!existingVacation) {
        return res.status(404).json({ message: "Vacation not found." });
      }

      let imageFileName = existingVacation.image;

      if (req.file) {
        imageFileName = req.file.filename;

        const oldImagePath = path.join(__dirname, "../../uploads", existingVacation.image);
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(`Error deleting old image: ${err.message}`);
            }
          });
        }
      }

      const updatedVacationData = {
        vacationCode: req.body.vacationCode,
        destination: req.body.destination,
        description: req.body.description,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        price: parseFloat(req.body.price),
        image: imageFileName,
      };

      const validationResult = vacationSchema.safeParse(updatedVacationData);
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Validation failed.",
          errors: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      const duplicateVacation = await db.collection("vacations").findOne({
        destination: updatedVacationData.destination,
        startDate: updatedVacationData.startDate,
        endDate: updatedVacationData.endDate,
        _id: { $ne: new ObjectId(vacationId) }, 
      });

      if (duplicateVacation) {
        return res.status(409).json({ message: "A vacation with the same destination and date already exists." });
      }

      const updateResult = await db.collection("vacations").updateOne(
        { _id: new ObjectId(vacationId) },
        { $set: updatedVacationData }
      );

      if (updateResult.matchedCount === 1) {
        return res.status(200).json({ message: "Vacation updated successfully", data: updatedVacationData });
      } else {
        return res.status(404).json({ message: "Vacation update failed." });
      }
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: "Something went wrong!", error: error.message });
    }
  }
);



adminRouter.delete('/delete-vacation/:id', verifyAdmin, async(req:Request, res:Response, next:NextFunction): Promise<any>=>{
    try {
        const vacationId = req.params.id;  
      const existingVacation = await db.collection("vacations").findOne({ _id: new ObjectId(vacationId) });
      if(existingVacation) {
        const oldImagePath = path.join(__dirname, "../../uploads", existingVacation.image);
        
        if (fs.existsSync(oldImagePath)) {
          fs.unlink(oldImagePath, (err) => {
            if (err) {
              console.error(`Error deleting old image: ${err.message}`);
            }
          });
        }
      }
      const result = await db.collection('vacations').deleteOne({_id: new ObjectId(vacationId)})
        if(result.deletedCount === 1){
            return res.json({message: 'Successfully deleted one document.'})
        }else{
            res.status(404).json({message: 'No documents match filter.'})
        }
    } catch (error:any) {
        return res.status(500).json({message: 'Something went wrong!', error: error.message})
    }
})

export default adminRouter