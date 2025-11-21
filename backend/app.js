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
import commentRoute from '../backend/routes/comment.route.js';
import automationRoute from './routes/ai.route.jsautomation.route.js';
import telegramRoute from './routes/telegram.route.js';
import calendarRoute from './routes/calendar.route.js';

const app = express();

// Debug environment variables
// console.log('🔧 Environment Variables Check:');
// console.log('PORT:', process.env.PORT);
// console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Present' : 'Missing');
// console.log('MONGODB_URI:', process.env.MONGODB_ATLUS_URL ? 'Present' : 'Missing');

// Define session options
const sessionOptions = {
    secret: process.env.JWT_SECRET || "fallback_secret_code",
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        maxAge: 28 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
    }
}

// MIDDLEWARES
app.use(session(sessionOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    'https://tf-team-task-manager.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);


// const allowedOrigins = [
//     'http://localhost:5173',
//     'http://localhost:3000',
//     // 'https://breezblogs.vercel.app',
//   ];

// app.use(cors({
//     // origin:'http://localhost:5173',
//     // origin: "https://breezblogs.vercel.app",
//     origin: (origin, callback) => {
//         if (!origin || allowedOrigins.includes(origin)) {
//           callback(null, true);
//         } else {
//           callback(new Error('Not allowed by CORS'));
//         }
//       }, 
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE"],
// }));

// Express-fileupload middleware
const fileUploadMiddleware = fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
});

const port = process.env.PORT || 3000;
const dbUrl = process.env.MONGODB_ATLUS_URL;

// Test route
app.get("/api/test", (req, res) => {
    res.json({ 
        message: "Backend is running!",
        timestamp: new Date().toISOString(),
        port: process.env.PORT
    });
});

// Health check route
app.get("/health", (req, res) => {
    res.status(200).json({ 
        status: "OK", 
        message: "Server is healthy",
        time: new Date().toISOString()
    });
});

// Routes
app.use("/user", fileUploadMiddleware, userRoute);
app.use("/group", groupRoute);
app.use("/task", fileUploadMiddleware, taskRoute);
app.use("/comment", commentRoute);
app.use("/automation", automationRoute);
app.use("/api/telegram", telegramRoute); 
app.use("/calendar", calendarRoute);

app.get("/",(req,res)=>{
    res.send("Task Manager and Tracker backend Running")
})

// Add to your app.js
app.get("/api/debug-cookie", (req, res) => {
  // console.log('🍪 Received cookies:', req.cookies);
  // console.log('🍪 jwttoken present:', !!req.cookies.jwttoken);
  
  res.json({
    cookiesReceived: req.cookies,
    jwttokenPresent: !!req.cookies.jwttoken,
    message: "Check your backend console for cookie details"
  });
});
// FIXED: 404 handler - use a proper path
app.use((req, res) => {
    res.status(404).json({ 
        message: "Route not found",
        path: req.originalUrl,
        method: req.method
    });
});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error("🔥 Server Error:", error);
    res.status(500).json({ 
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

async function dbConnection() {
    try {
        console.log('🔗 Attempting to connect to database...');
        await mongoose.connect(dbUrl);
        console.log("✅ DB connected successfully");
        
        app.listen(port, () => {
            console.log(`🚀 Server running on port: ${port}`);
            // console.log(`📡 Test the server at: http://localhost:${port}/api/test`);
            // console.log(`❤️  Health check at: http://localhost:${port}/health`);
        });
        
    } catch (error) {
        console.error("❌ Database connection failed:", error);
        process.exit(1);
    }
}

dbConnection();