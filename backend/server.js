import express from 'express';
import path from 'path';
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import passport from "passport";
import "./config/passport.js";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import newsRoutes from "./routes/newsRoutes.js";
import { protect } from "./middleware/authMiddleware.js";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import User from "./models/user.js";
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 40,
  message: {
    error: "Too many auth attempts. Please try again later."
  }
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    error: "Too many chat requests. Calm down and try again later."
  }
});
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());
app.disable("etag");

app.use(express.static(path.join(__dirname, "../frontend"), {
    etag: false,
    lastModified: false,
    setHeaders: (res) => {
        res.setHeader(
            "Cache-Control",
            "no-store, no-cache, must-revalidate, proxy-revalidate"
        );
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
        res.setHeader("Surrogate-Control", "no-store");
    }
}));
app.get('/',(req,res)=>{
    res.sendFile(path.join(__dirname, '../frontend/pages/index.html'));
})
app.get('/dashboard', protect, (req, res) => {
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
app.get('/onboarding', protect, (req,res)=>{
    res.sendFile(
        path.join(__dirname, '../frontend/pages/onboarding.html')
    );
});
app.get('/profile', protect, (req, res) => {
    res.sendFile(
        path.join(__dirname, '../frontend/pages/profile.html')
    );
});
app.get('/blogs', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/blogs.html'));
}); 
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);
app.get("/auth/google/callback",
    passport.authenticate("google", { session: false }),
    async (req, res) => {
        try {
            const { token, userId } = req.user;

            const user = await User.findById(userId);

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "strict",
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            if (user.profileCompleted) {
                return res.redirect("/dashboard");
            } else {
                return res.redirect("/onboarding");
            }

        } catch (error) {
            console.error(error);
            res.redirect("/login");
        }
    }
);
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});
app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/chat", chatLimiter, chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/news", newsRoutes);
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});