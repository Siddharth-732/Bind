import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js";
import {
  createLodge,
  getAllLodges,
  getMyLodges,
  joinLodge,
  createChannel,
  getLodgeChannels,
} from "../controllers/lodge.controllers.js";

const router = Router();
router.use(verifyJWT);
router.route("/").get(getAllLodges);
router.route("/").post(upload.single("avatar"), createLodge);
router.route("/my-lodges").get(getMyLodges);
router.route("/:lodgeId/join").post(joinLodge);
router.route("/:lodgeId/channels").post(createChannel);
router.route("/:lodgeId/channels").get(getLodgeChannels);

export default router;
