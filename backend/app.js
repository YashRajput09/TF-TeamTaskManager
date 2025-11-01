import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import mongoose from 'mongoose';
const app = express();


const port = process.env.PORT;
const dbUrl = process.env.MONGODB_ATLUS_URL;
async function dbConnection() {
    try {
        await mongoose.connect(dbUrl);
        console.log("DB connected");
        
    } catch (error) {
        console.log(error);
    }
    app.listen(port, ()=>{
        console.log(`Listening on port: ${port}`);
    });
}
dbConnection();

app.use("/",(req, res)=>{
    res.send("Radhe Radhe");
})