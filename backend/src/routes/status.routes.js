import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createStatus,
  getStatuses,
  deleteStatus,
} from "../controllers/status.controllers.js";

const router = Router();

router.use(verifyJWT);

// Get all active statuses
router.route("/").get(getStatuses);

router.route("/").post(upload.single("media"), createStatus);

router.route("/:statusId").delete(deleteStatus);

export default router;
