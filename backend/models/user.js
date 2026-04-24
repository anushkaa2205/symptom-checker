import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  Fname: String,
  Lname: String,
  email: {
    type: String,
    required: true,
    unique: true
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
}
}, { timestamps: true });

export default mongoose.model("User", userSchema);