import { Conversation } from "../models/conservation.models.js";
import { Message } from "../models/message.models.js";
import { getReceiverSocketId, getIO } from "../socket/index.js";

export const sendMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    if (!content) {
      return res
        .status(400)
        .json({ message: "Message content cannot be empty" });
    }

    // the conversation where BOTH users are participants
    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] },
    });

    // if they have never chatted before, create a new conversation folder
    if (!conversation) {
      conversation = await Conversation.create({
        participants: [senderId, receiverId],
      });
    }

    // create the actual message document
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
    });

    // put the message inside the conversation folder and update the preview
    if (newMessage) {
      conversation.messages.push(newMessage._id);
      conversation.lastMessage = newMessage._id;
    }

    // save both the message and the conversation to the database AT THE SAME TIME.
    // This is much faster than saving one, waiting, and then saving the other.
    await Promise.all([conversation.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(receiverId);

    if (receiverSocketId) {
      const io = getIO();
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params; // The ID of the friend we clicked on
    const senderId = req.user._id; // Our ID

    // find the conversation between us and them
    const conversation = await Conversation.findOne({
      participants: { $all: [senderId, userToChatId] },
    }).populate("messages");

    // if they haven't chatted yet, just return an empty array (no error needed)
    if (!conversation) {
      return res.status(200).json({ success: true, data: [] });
    }

    // return the fully populated array of messages
    return res.status(200).json({
      success: true,
      data: conversation.messages,
    });
  } catch (error) {
    console.error("Error in getMessages controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getConversations = async (req, res) => {
  try {
    const senderId = req.user._id;

    // extract cursor and limit from the query string (default limit to 15)
    const limit = parseInt(req.query.limit) || 15;
    const cursor = req.query.cursor;

    // base query: Find chats I am a part of
    let query = { participants: { $in: [senderId] } };

    // if a cursor is provided, only find chats OLDER than that exact timestamp
    if (cursor) {
      query.updatedAt = { $lt: new Date(cursor) };
    }

    const conversations = await Conversation.find(query)
      .populate("participants", "displayName avatar email")
      .populate("lastMessage")
      .sort({ updatedAt: -1 })
      .limit(limit);

    let nextCursor = null;
    // if the number of chats returned equals our limit, it means there are probably more in the database.
    if (conversations.length === limit) {
      nextCursor = conversations[conversations.length - 1].updatedAt;
    }

    return res.status(200).json({
      success: true,
      data: conversations,
      nextCursor, // The frontend will save this to use on the next scroll!
    });
  } catch (error) {
    console.error("Error in getConversations controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsDelivered = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    // Update all messages sent by senderId to receiverId where isDelivered is false
    await Message.updateMany(
      { senderId, receiverId, isDelivered: false },
      { $set: { isDelivered: true } },
    );

    return res
      .status(200)
      .json({ success: true, message: "Messages marked as delivered" });
  } catch (error) {
    console.error(
      "Error in markMessagesAsDelivered controller: ",
      error.message,
    );
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markMessagesAsRead = async (req, res) => {
  try {
    const { id: senderId } = req.params;
    const receiverId = req.user._id;

    // Update all messages sent by senderId to receiverId where isRead is false
    await Message.updateMany(
      { senderId, receiverId, isRead: false },
      { $set: { isRead: true, isDelivered: true } }, // Mark as delivered too, just in case
    );

    return res
      .status(200)
      .json({ success: true, message: "Messages marked as read" });
  } catch (error) {
    console.error("Error in markMessagesAsRead controller: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
