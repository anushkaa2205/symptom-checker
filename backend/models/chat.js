import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  title: {
    type: String,
    default: "New Assessment"
  },
  messages: [
    {
      sender: String,
      text: String
    }
  ]
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);