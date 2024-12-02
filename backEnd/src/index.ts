import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import bodyParser from "body-parser"
import userRouter from "./routes/userRoutes"
import adminRouter from "./routes/adminRoutes"
import { connectionToMongoDB,db } from './db/mongoClient'
import path from 'path'
import fs from "fs"
import mockData from "../mockVacations.json"
const typedMockData = mockData as any[];

dotenv.config()

const app = express()

const uploadsPath = path.join(__dirname, "..", "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true }); 
}

async function insertMockData() {
  try {
      await connectionToMongoDB()
  const existingData = await db.collection("vacations").find().toArray()
if(existingData.length===0) {
  await db.collection("vacations").insertMany(typedMockData)
}
  } catch (error) {
    
  }
}
insertMockData()

app.use(cors())
app.use(bodyParser.json())
app.use(express.urlencoded({extended: true}))
app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
app.use("/users", userRouter)
app.use('/admin', adminRouter)

if (process.env.NODE_ENV !== "test") {
  app.listen(process.env.RUNNING_ON_PORT, () => {
    console.log(`server running on port ${process.env.RUNNING_ON_PORT}`);
  });
}
export default app