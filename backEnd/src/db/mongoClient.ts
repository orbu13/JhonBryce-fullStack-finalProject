import { MongoClient, Db } from "mongodb"
const mongoURI = 'mongodb://localhost:27017/'
const client = new MongoClient(mongoURI)
let db:Db


async function connectionToMongoDB(){
    try {
        await client.connect()
        db = client.db("Vacation_data")
        console.log('connected to mongoDB')
    } catch (error) {
        console.log('mongoDB connection error', error)
    }
}

export {connectionToMongoDB, client, db}