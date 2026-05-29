import { Router } from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetails,
  changeCurrentPassword,
  updateUserAvatar,
} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
  ]),
  registerUser,
);
router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-avatar").patch(
  verifyJWT,
  upload.single("avatar"), // Multer grabs the single file named "avatar"
  updateUserAvatar,
);
export default router;
