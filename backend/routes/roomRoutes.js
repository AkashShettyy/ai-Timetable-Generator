import express from "express";
import { protect, adminOnly } from "../middleware/authMiddleware.js";
import {
  createRoom,
  getRooms,
  updateRoom,
  deleteRoom,
} from "../controllers/roomController.js";

const router = express.Router();

router.route("/")
  .get(protect, getRooms)
  .post(protect, adminOnly, createRoom);

router.route("/:id")
  .put(protect, adminOnly, updateRoom)
  .delete(protect, adminOnly, deleteRoom);

export default router;
