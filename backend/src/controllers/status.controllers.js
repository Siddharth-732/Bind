import { Status } from "../models/status.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createStatus = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user._id;

    let mediaUrl = "";
    let mediaType = "none";

    const mediaLocalPath = req.file?.path;

    if (mediaLocalPath) {
      const cloudinaryResponse = await uploadOnCloudinary(mediaLocalPath);
      if (cloudinaryResponse) {
        mediaUrl = cloudinaryResponse.url;
        // Determine if it's an image or video based on Cloudinary resource_type or extension
        mediaType =
          cloudinaryResponse.resource_type === "video" ? "video" : "image";
      }
    }

    if (!content && !mediaUrl) {
      return res
        .status(400)
        .json({ message: "Status must contain either text or media" });
    }

    const status = await Status.create({
      user: userId,
      content: content || "",
      mediaUrl,
      mediaType,
    });

    return res.status(201).json({
      success: true,
      message: "Status created successfully",
      status,
    });
  } catch (error) {
    console.error("Error in createStatus:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getStatuses = async (req, res) => {
  try {
    // For now, let's fetch all active statuses across the platform.
    // In a more complex app, you might only fetch statuses of the user's peers/friends.
    const statuses = await Status.find()
      .populate("user", "displayName username avatar")
      .sort({ createdAt: -1 }); // Newest first

    return res.status(200).json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error("Error in getStatuses:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteStatus = async (req, res) => {
  try {
    const { statusId } = req.params;
    const userId = req.user._id;

    const status = await Status.findById(statusId);

    if (!status) {
      return res.status(404).json({ message: "Status not found" });
    }

    // Ensure the user deleting the status is the one who created it
    if (status.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You can only delete your own status" });
    }

    await Status.findByIdAndDelete(statusId);

    return res.status(200).json({
      success: true,
      message: "Status deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteStatus:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
