import express from "express";
import {
  createPost,
  getGlobalFeed,
  toggleLike,
  getUserPosts,
} from "../controllers/post.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

// Apply auth middleware to all routes in this file
router.use(verifyJWT);

router.route("/").post(upload.single("image"), createPost).get(getGlobalFeed);
router.route("/user/:username").get(getUserPosts);
router.route("/:id/like").post(toggleLike);

export default router;
