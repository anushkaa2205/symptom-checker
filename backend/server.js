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
import mongoose from "mongoose";
import { warmNewsCache } from "./routes/newsRoutes.js";
connectDB();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
// Render puts one proxy in front of the app. Trusting it lets the rate limiters see each
// visitor's real IP (otherwise everyone shares one limit) and lets secure cookies work.
app.set('trust proxy', 1);
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 40,
  message: {
    error: "Too many auth attempts. Please try again later."
  }
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 40,
  message: {
    error: "Too many chat requests. Calm down and try again later."
  }
});
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Lightweight endpoint for an uptime pinger (cron-job.org / UptimeRobot) to hit every
// ~10 minutes so Render's free plan doesn't put the server to sleep.
app.get("/health", (req, res) => {
    res.set("Cache-Control", "no-store");
    res.json({
        status: "ok",
        db: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
        uptimeSeconds: Math.round(process.uptime())
    });
});

// Let browsers cache CSS/JS/images instead of re-downloading everything on every page
// (it used to send no-store for all of them). HTML is always revalidated, which is a
// cheap 304 when unchanged, so new deploys still show up straight away.
app.use(express.static(path.join(__dirname, "../frontend"), {
    setHeaders: (res, filePath) => {
        if (filePath.endsWith(".html")) {
            res.setHeader("Cache-Control", "no-cache");
        } else if (/[\\/]assets[\\/]|favicon/.test(filePath)) {
            res.setHeader("Cache-Control", "public, max-age=604800"); // images: 7 days
        } else {
            res.setHeader("Cache-Control", "public, max-age=600"); // css/js: 10 min, then revalidate
        }
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
app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/terms.html'));
});
app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/pages/privacy.html'));
});
app.get("/auth/google",
    passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);
app.get("/auth/google/callback", (req, res, next) => {
    passport.authenticate("google", { session: false }, async (err, user, info) => {
        if (err) {
            console.error('[Auth] Passport Auth Error:', err);
            return res.redirect("/login?error=passport_err");
        }
        if (!user) {
            console.error('[Auth] No user returned from Passport:', info);
            return res.redirect("/login?error=no_user");
        }

        try {
            console.log('[Auth] Google Callback processing for user:', user.userId);
            const { token, userId } = user;

            const dbUser = await User.findById(userId);
            if (!dbUser) {
                console.error('[Auth] User not found in DB after OAuth:', userId);
                return res.redirect("/login?error=db_error");
            }

            res.cookie("token", token, {
                httpOnly: true,
                sameSite: "lax",
                secure: process.env.NODE_ENV === "production",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            if (dbUser.profileCompleted) {
                return res.redirect("/dashboard?login=success");
            } else {
                return res.redirect("/onboarding?login=success");
            }

        } catch (error) {
            console.error('[Auth] Callback Logic Error:', error.message);
            res.redirect("/login?error=callback_error");
        }
    })(req, res, next);
});
app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out successfully" });
});
// Limit only the endpoints worth abusing: login/register attempts and AI chat replies.
// (Previously every /api/auth and /api/chat call counted, so normal browsing -
// the login check on each page, loading and saving chat history - used up the limit.)
app.use(["/api/auth/login", "/api/auth/register"], authLimiter);
app.use("/api/auth", authRoutes);
app.use("/api/chat", (req, res, next) =>
    req.method === "POST" && req.path === "/" ? chatLimiter(req, res, next) : next()
);
app.use("/api/chat", chatRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/news", newsRoutes);
// Render assigns the port through PORT; 5000 is the local default.
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Fetch health news in the background so the first Blogs visitor doesn't wait for it.
    warmNewsCache();
});