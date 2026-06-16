import { Router } from "express";
import {
  getMessages,
  sendMessage,
  getConversations,
  markMessagesAsDelivered,
  markMessagesAsRead,
} from "../controllers/message.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/conversations").get(verifyJWT, getConversations);
router.route("/:id").get(verifyJWT, getMessages);
router.route("/send/:id").post(verifyJWT, sendMessage);
router.route("/delivered/:id").put(verifyJWT, markMessagesAsDelivered);
router.route("/read/:id").put(verifyJWT, markMessagesAsRead);

export default router;
