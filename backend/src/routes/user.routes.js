import { Router } from "express";
import {
  getUsersForSidebar,
  registerUser,
  checkUsername,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updateAccountDetails,
  changeCurrentPassword,
  updateUserAvatar,
  updateUserBanner,
} from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
const router = Router();
router.route("/check-username").get(checkUsername);
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
router.route("/").get(verifyJWT, getUsersForSidebar);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);
router.route("/change-password").post(verifyJWT, changeCurrentPassword);
router.route("/update-avatar").patch(
  verifyJWT,
  upload.single("avatar"), // multer grabs the single file named "avatar"
  updateUserAvatar,
);
router.route("/update-banner").patch(
  verifyJWT,
  upload.single("banner"), // multer grabs the single file named "banner"
  updateUserBanner,
);
export default router;
