import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  Fname: {
    type: String,
    required: true,
    trim: true
  },

  Lname: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: function () {
      return !this.googleId;
    }
  },

  googleId: {
    type: String,
    default: null
  },

  profileCompleted: {
    type: Boolean,
    default: false
  },

  healthProfile: {
    age: {
      type: Number,
      min: 1,
      max: 120
    },

    gender: {
      type: String,
      enum: ["Male", "Female", "Other"]
    },

    height: {
      type: Number,
      min: 30,
      max: 300
    },
    weight: {
      type: Number,
      min: 1,
      max: 500
    },

    allergies: [{
      type: String
    }],
    previousMedicalHistory: [{
  type: String
  }],
    medications: [{
      type: String
    }],

    chronicConditions: [{
      type: String
    }],

    bloodGroup: {
  type: String,
  enum: [
    "A+",
    "A-",
    "B+",
    "B-",
    "AB+",
    "AB-",
    "O+",
    "O-"
  ]
},
    
    emergencyContact: {
  name: {
    type: String,
    trim: true
  },
  relation: {
    type: String,
    trim: true
  },
  phone: {
    type: String
  }
},
profilePicture: {
  type: String,
  default: null
}
  }

}, { timestamps: true });

export default mongoose.model("User", userSchema);