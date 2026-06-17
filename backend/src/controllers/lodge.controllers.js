import { Lodge } from "../models/lodge.models.js";
import { Channel } from "../models/channel.models.js";
import { LodgeMember } from "../models/lodgeMember.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

export const createLodge = async (req, res) => {
  try {
    const { name, description, isPublic } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "Lodge name is required" });
    }

    let avatarUrl = "";
    const avatarLocalPath = req.file?.path;

    if (avatarLocalPath) {
      const cloudinaryResponse = await uploadOnCloudinary(avatarLocalPath);
      if (cloudinaryResponse) {
        avatarUrl = cloudinaryResponse.url;
      }
    }

    // lodge created
    const lodge = await Lodge.create({
      name,
      description: description || "",
      isPublic: isPublic !== undefined ? isPublic : true,
      avatar: avatarUrl,
      creator: userId,
    });

    // creator as the 'captain' in LodgeMember
    await LodgeMember.create({
      user: userId,
      lodge: lodge._id,
      role: "captain",
    });

    // create a default #general channel
    const defaultChannel = await Channel.create({
      name: "general",
      type: "text",
      lodge: lodge._id,
    });

    return res.status(201).json({
      success: true,
      message: "Lodge created successfully",
      lodge,
      defaultChannel,
    });
  } catch (error) {
    console.error("Error in createLodge:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllLodges = async (req, res) => {
  try {
    // fetch all public lodges for the discovery page
    const lodges = await Lodge.find({ isPublic: true })
      .populate("creator", "displayName username avatar")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: lodges,
    });
  } catch (error) {
    console.error("Error in getAllLodges:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMyLodges = async (req, res) => {
  try {
    const userId = req.user._id;

    // find all memberships for this user, and populate the lodge data
    const memberships = await LodgeMember.find({ user: userId })
      .populate("lodge")
      .sort({ createdAt: -1 });

    // extract just the lodge objects (with the user's role attached if needed)
    const myLodges = memberships.map((m) => ({
      ...m.lodge.toObject(),
      myRole: m.role,
    }));

    return res.status(200).json({
      success: true,
      data: myLodges,
    });
  } catch (error) {
    console.error("Error in getMyLodges:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const joinLodge = async (req, res) => {
  try {
    const { lodgeId } = req.params;
    const userId = req.user._id;

    const lodge = await Lodge.findById(lodgeId);
    if (!lodge) {
      return res.status(404).json({ message: "Lodge not found" });
    }

    // Check if user is already a member
    const existingMembership = await LodgeMember.findOne({
      user: userId,
      lodge: lodgeId,
    });
    if (existingMembership) {
      return res
        .status(400)
        .json({ message: "You are already a member of this lodge" });
    }

    // create membership (crew by default)
    const membership = await LodgeMember.create({
      user: userId,
      lodge: lodgeId,
      role: "crew",
    });

    return res.status(201).json({
      success: true,
      message: "Successfully joined the lodge",
      membership,
    });
  } catch (error) {
    // Check if it's a MongoDB duplicate key error (11000)
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "You are already a member of this lodge" });
    }
    console.error("Error in joinLodge:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const createChannel = async (req, res) => {
  try {
    const { lodgeId } = req.params;
    const { name, type } = req.body;
    const userId = req.user._id;

    if (!name) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    // Verify the user is a captain of this lodge
    const membership = await LodgeMember.findOne({
      user: userId,
      lodge: lodgeId,
    });
    if (!membership || membership.role !== "captain") {
      return res
        .status(403)
        .json({ message: "Only lodge captains can create channels" });
    }

    const channel = await Channel.create({
      name: name.toLowerCase(),
      type: type || "text",
      lodge: lodgeId,
    });

    return res.status(201).json({
      success: true,
      message: "Channel created successfully",
      channel,
    });
  } catch (error) {
    console.error("Error in createChannel:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLodgeChannels = async (req, res) => {
  try {
    const { lodgeId } = req.params;
    const userId = req.user._id;

    // Optional: Check if user is a member of the lodge before showing channels
    const membership = await LodgeMember.findOne({
      user: userId,
      lodge: lodgeId,
    });
    if (!membership) {
      return res
        .status(403)
        .json({ message: "You must join the lodge to view channels" });
    }

    const channels = await Channel.find({ lodge: lodgeId }).sort({
      createdAt: 1,
    });

    return res.status(200).json({
      success: true,
      data: channels,
    });
  } catch (error) {
    console.error("Error in getLodgeChannels:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getLodgeMembers = async (req, res) => {
  try {
    const { lodgeId } = req.params;
    const userId = req.user._id;

    // Optional: Check if user is a member of the lodge before showing members
    const membership = await LodgeMember.findOne({
      user: userId,
      lodge: lodgeId,
    });
    
    if (!membership) {
      return res
        .status(403)
        .json({ message: "You must join the lodge to view members" });
    }

    const members = await LodgeMember.find({ lodge: lodgeId })
      .populate("user", "displayName username avatar")
      .sort({ role: 1, createdAt: 1 });

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Error in getLodgeMembers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
