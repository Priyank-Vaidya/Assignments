import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  rating: { type: Number, required: true },
  reviewText: { type: String, required: true },
  aiResponse: { type: String },
  aiSummary: { type: String },
  aiAction: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);