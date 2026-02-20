import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  capacity: { type: Number, required: true },
  features: [{ type: String }],
  building: { type: String },
  created_at: { type: Date, default: Date.now }
});

export default mongoose.model("Room", roomSchema);
