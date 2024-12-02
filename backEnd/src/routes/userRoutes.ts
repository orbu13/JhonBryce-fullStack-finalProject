import express, {NextFunction, Request, Response, Router} from "express"
import {z} from 'zod'
import { db } from "../db/mongoClient"
import verifyUser from "../middleware/verifyLogin"
import { ObjectId } from "mongodb"
type User = {id: string}
const userRouter = Router()
const userSchema = z.object({firstName: z.string().min(3, 'First name is require.').max(10, 'First name most be 10 characters or less.'), lastName:  z.string().min(3, 'Last name is require.').max(10, 'Last name most be 10 characters or less.'),email: z.string().email('Add valid email address'), password: z.string().min(5, 'Password most be longer then 5 characters').max(15, 'Password most be shorter then 15 characters')})

userRouter.get('/vacations', verifyUser, async(req:Request, res:Response, next:NextFunction): Promise<any>=>{
    try {
            const vacation = await db.collection('vacations').find().toArray()
            return res.json({message: 'Success', data: vacation})
    } catch (error:any) {
        return res.status(500).json({message: 'Something went wrong', error: error.message})
    }
})

userRouter.post("/register", async (req, res): Promise<any> => {
    try {
      const validData = userSchema.parse(req.body);
      const existingUser = await db.collection("users").findOne({ email: req.body.email });
  
      if (existingUser) {
        return res.status(409).json({ message: "Email has been used. Try again." });
      }
  
      req.body.loggedIn = true;
      req.body.loggedInDate = new Date();
      req.body.role = "user";
  
      const result = await db.collection("users").insertOne(req.body);
  
      const newUserData = { ...req.body, _id: result.insertedId };
  
      return res.status(201).json({ message: "success", data: newUserData });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation failed", error: error.errors });
      } else {
        return res.status(500).json({ message: "Unexpected error", error: error.message });
      }
    }
  });
   
userRouter.post('/login', async(req:Request, res:Response) : Promise<any>=>{
    try {
        const {email, password} = req.body
        const foundUser = await db.collection('users').findOne({email: email, password: password})
        if(foundUser === null){
            return res.status(400).json({message: 'Email or password is incorrect.'})
        }
        if(foundUser.role !== "user") {
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


userRouter.post('/logout', verifyUser, async (req: Request, res: Response, next: NextFunction): Promise <any> => {
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

userRouter.post('/follow-vacation/:id',verifyUser, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const vacationId = req.params.id;
        const userId = req.body.user.id; 
        const vacation = await db.collection('vacations').findOne({ _id: new ObjectId(vacationId) });

        if (!vacation) {
            return res.status(404).json({ message: 'Vacation not found.' });
        }

        if (vacation.followers.includes(userId)) {
            return res.status(400).json({ message: 'You are already following this vacation.' });
        }

        await db.collection('vacations').updateOne(
            { _id: new ObjectId(vacationId) },
            { $addToSet: { followers: userId } } 
        );

        return res.status(201).json({ message: 'Successfully followed the vacation.' });

    } catch (error: any) {
        return res.status(500).json({ message: 'Something went wrong!', error: error.message });
    }
});

userRouter.post('/unfollow-vacation/:id', verifyUser, async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        const vacationId = req.params.id;
        const userId = req.body.user.id;
        const vacation = await db.collection('vacations').findOne({ _id: new ObjectId(vacationId) });

        if (!vacation) {
            return res.status(404).json({ message: 'Vacation not found.' });
        }

        if (!vacation.followers.includes(userId)) {
            return res.status(400).json({ message: 'You are not following this vacation.' });
        }

        await db.collection('vacations').updateOne(
            { _id: new ObjectId(vacationId) },
            { $pull: { followers: userId } } 
        );

        return res.status(200).json({ message: 'Successfully unfollowed the vacation.' });

    } catch (error: any) {
        return res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
});


export default userRouter