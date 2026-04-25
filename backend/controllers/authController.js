import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d"
  });
};

export const registerUser = async (req, res) => {
  const { Fname, Lname, email, password } = req.body;

  try {
    if (!Fname || !Lname || !email || !password) {
      return res.status(400).json({
        message: "Please fill all fields"
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters"
      });
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      Fname,
      Lname,
      email,
      password: hashedPassword
    });

    const token = generateToken(user._id);

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.json({
    message: "User registered",
    profileCompleted: user.profileCompleted
});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user._id);

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000
});

    res.json({
    message: "Login successful",
    profileCompleted: user.profileCompleted
});

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req, res) => {
    if (req.user) {
        res.json({ name: req.user.Fname || req.user.name || 'User' });
    } else {
        res.status(401).json({ message: "Not logged in" });
    }
};

export const logoutUser = (req, res) => {
    res.cookie("token", "", {
        httpOnly: true,
        expires: new Date(0)
    });
    res.json({ message: "Logged out" });
};
export const completeProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    const {
  age,
  gender,
  height,
  weight,
  allergies,
  medications,
  chronicConditions,
  previousMedicalHistory,
  bloodGroup,
  emergencyContact
} = req.body;

    user.healthProfile = {
  age,
  gender,
  height,
  weight,
  allergies,
  medications,
  chronicConditions,
  previousMedicalHistory,
  bloodGroup,
  emergencyContact
};
    user.profileCompleted = true;

    await user.save();

    res.json({
      message: "Profile completed successfully"
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    res.json(user);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};