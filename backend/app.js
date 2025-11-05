import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import session from 'express-session';
import fileUpload from 'express-fileupload';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoute from '../backend/routes/user.route.js';
import groupRoute from '../backend/routes/group.route.js';
import taskRoute from '../backend/routes/task.route.js';
// import categoryRoute from '../backend/routes/category.routes.js';
const app = express();

// define session options
const sessionOptions = {
    secret: "secret code",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 28 * 24 * 60 * 60 * 1000,
    maxAge: 28 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    } 
}

//MIDDLEWARES
app.use(session(sessionOptions));
app.use(express.json()); // Parse application/json
app.use(express.urlencoded({ extended: true })); // Parse application/x-www-form-urlencoded
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    // 'https://breezblogs.vercel.app',
  ];

app.use(cors({
    // origin:'http://localhost:5173',
    // origin: "https://breezblogs.vercel.app",
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      }, 
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

// Express-fileupload middleware for normal uploads
const fileUploadMiddleware = fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
//   parseNested: true,      // ✅ important
//   preserveExtension: true 
});


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

app.use(["/", "/user"],fileUploadMiddleware, userRoute);
app.use("/group",groupRoute);
app.use("/task",fileUploadMiddleware,taskRoute);
// app.use("/category",categoryRoute);
