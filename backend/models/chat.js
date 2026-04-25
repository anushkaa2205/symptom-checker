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
    sender: {
      type: String,
      enum: ["user", "ai"]
    },

    text: {
      type: String,
      required: true
    },

    messageType: {
      type: String,
      enum: ["text", "report-analysis", "recommendation"],
      default: "text"
    },

    timestamp: {
      type: Date,
      default: Date.now
    },
    reportId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: "Report"
}
  }
]
}, { timestamps: true });

export default mongoose.model("Chat", chatSchema);