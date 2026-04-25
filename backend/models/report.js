import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  fileUrl: {
    type: String,
    required: true
  },

  extractedText: {
    type: String
  },

  aiAnalysis: {
    type: String
  },

  reportType: {
    type: String
  }

}, { timestamps: true });

export default mongoose.model("Report", reportSchema);