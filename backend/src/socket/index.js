import { Server } from "socket.io";

let io;
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

const allowedOrigins = [
  "http://localhost:3000",
  "https://pulse-chat-a1a4.vercel.app",
  process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.trim().replace(/\/$/, "") : ""
].filter(Boolean);

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log(`New connection: ${socket.id}`);

    // when the frontend connects it will pass the users ID in the query
    const userId = socket.handshake.query.userId;

    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    // list of ALL online users to everyone
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    // Channel Room Management
    socket.on("join-channel", (channelId) => {
      socket.join(channelId);
      console.log(`Socket ${socket.id} joined channel ${channelId}`);
    });

    socket.on("leave-channel", (channelId) => {
      socket.leave(channelId);
      console.log(`Socket ${socket.id} left channel ${channelId}`);
    });

    // Typing Indicators
    socket.on("typing", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userTyping", { senderId: userId });
      }
    });

    socket.on("stopTyping", ({ receiverId }) => {
      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("userStoppedTyping", { senderId: userId });
      }
    });

    // Message Lifecycle (Read Receipts)
    socket.on("messageDelivered", ({ senderId }) => {
      // The person who received the message is telling us it got delivered
      // We bounce this back to the original sender
      const originalSenderSocketId = getReceiverSocketId(senderId);
      if (originalSenderSocketId) {
        io.to(originalSenderSocketId).emit("messagesDelivered", {
          receiverId: userId,
        });
      }
    });

    socket.on("markAsRead", ({ senderId }) => {
      // The person who received the message is telling us they read it
      // We bounce this back to the original sender
      const originalSenderSocketId = getReceiverSocketId(senderId);
      if (originalSenderSocketId) {
        io.to(originalSenderSocketId).emit("messagesRead", {
          receiverId: userId,
        });
      }
    });

    socket.on("disconnect", () => {
      console.log(`Disconnected: ${socket.id}`);
      // Remove them from the phonebook
      if (userId) {
        delete userSocketMap[userId];
      }
      // Update everyone else's "Online" list
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

// UPDATE THE LOG BEFORE BUILD !!
export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized in socket.js!");
  }
  return io;
};
