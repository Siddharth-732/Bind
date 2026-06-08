import { Server } from "socket.io";

let io;
const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN,
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
    /*  TODO: for now we update the online check for all the user,
     we need to implement this for only the peers for a particular user. */

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
