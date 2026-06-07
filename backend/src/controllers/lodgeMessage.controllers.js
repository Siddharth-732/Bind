import { LodgeMessage } from "../models/lodgeMessage.models.js";
import { getIO } from "../socket/index.js";

export const sendChannelMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { channelId } = req.params;
    const senderId = req.user._id;

    if (!content) {
      return res.status(400).json({ message: "Message content cannot be empty" });
    }

    const newMessage = await LodgeMessage.create({
      senderId,
      channelId,
      content,
    });

    // Populate sender details so the frontend can display avatar/name
    await newMessage.populate("senderId", "displayName avatar email");

    const io = getIO();
    // Emit to the specific channel room
    io.to(channelId).emit("newChannelMessage", newMessage);

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in sendChannelMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getChannelMessages = async (req, res) => {
  try {
    const { channelId } = req.params;

    const messages = await LodgeMessage.find({ channelId })
      .populate("senderId", "displayName avatar email")
      .sort({ createdAt: 1 }); // Oldest first for chat view

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("Error in getChannelMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
