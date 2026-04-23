import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
console.log("ENV CHECK:", process.env.GOOGLE_CLIENT_ID);
import passport from "passport";
import "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";

connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, "../frontend")));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
})
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/dashboard.html'));
});
app.get('/chat', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/chat.html'));
});
app.get('/login',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
})
app.get('/register',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
})
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get("/auth/google/callback",
    passport.authenticate("google", { session: false }),
    (req, res) => {
        const { token } = req.user;

        res.cookie("token", token, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
            maxAge: 60*1000
        });

        res.redirect("/dashboard");
    }
);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});