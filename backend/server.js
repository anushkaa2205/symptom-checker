import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";

import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
dotenv.config();
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "../frontend")));

app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
})
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
})
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
})

app.get('/dashboard', protect, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});
app.use("/api/auth", authRoutes);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});