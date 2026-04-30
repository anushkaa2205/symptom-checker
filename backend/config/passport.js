import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import fs from "fs";

function logError(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync("debug.log", line);
}

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback"
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        logError(`Google Profile received: ${profile.id} - ${profile.emails?.[0]?.value}`);
        const email = profile.emails?.[0]?.value || profile._json?.email;
        if (!email) {
          logError('No email found in Google profile');
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await User.findOne({ email });

        if (!user) {
          logError(`Creating new user for ${email}`);
          user = await User.create({
            Fname: profile.name?.givenName || profile.displayName?.split(' ')[0] || "User",
            Lname: profile.name?.familyName || profile.displayName?.split(' ').slice(1).join(' ') || "Google",
            email,
            googleId: profile.id
          });
          logError(`User created: ${user._id}`);
        }

        const token = jwt.sign(
          { id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        );

        return done(null, {
          token,
          userId: user._id
        });

      } catch (err) {
        logError(`Passport Error: ${err.message}\n${err.stack}`);
        return done(err, null);
      }
    }
  )
);