import { Router } from "express";
import {
  getAllAttachments,
  uploadImage,
} from "../controllers/attachment.controller";
import upload from "../middleware/upload";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    await getAllAttachments(req, res);
  } catch (error) {
    next(error);
  }
});

router.post("/:id", upload, async (req, res, next) => {
  try {
    await uploadImage(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
