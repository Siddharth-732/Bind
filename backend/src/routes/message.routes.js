import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getConversations,
} from "../controllers/message.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/conversations").get(verifyJWT, getConversations);
router.route("/:id").get(verifyJWT, getMessages);
router.route("/send/:id").post(verifyJWT, sendMessage);

export default router;
