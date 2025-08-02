const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));

// Store connected users and rooms
const connectedUsers = new Map();
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Handle user joining a room
  socket.on("join-room", (data) => {
    const { userId, roomId } = data;

    // Join the socket to the room
    socket.join(roomId);

    // Store user info
    connectedUsers.set(socket.id, { userId, roomId });

    // Initialize room if it doesn't exist
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Set());
    }

    // Add user to room
    rooms.get(roomId).add(socket.id);

    // Notify other users in the room
    socket.to(roomId).emit("user-joined", { userId, socketId: socket.id });

    // Send current room participants to the joining user
    const roomParticipants = Array.from(rooms.get(roomId))
      .filter((id) => id !== socket.id)
      .map((id) => connectedUsers.get(id)?.userId)
      .filter(Boolean);

    socket.emit("room-participants", roomParticipants);

    console.log(
      `User ${userId} joined room ${roomId} with socket ${socket.id}`
    );
  });

  // Handle WebRTC signaling within room
  socket.on("offer", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      socket.to(data.target).emit("offer", {
        offer: data.offer,
        from: socket.id,
        fromUserId: userInfo.userId,
      });
    }
  });

  socket.on("answer", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      socket.to(data.target).emit("answer", {
        answer: data.answer,
        from: socket.id,
      });
    }
  });

  socket.on("ice-candidate", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      socket.to(data.target).emit("ice-candidate", {
        candidate: data.candidate,
        from: socket.id,
      });
    }
  });

  // Handle chat messages
  socket.on("send-message", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo && userInfo.roomId === data.roomId) {
      const messageData = {
        userId: userInfo.userId,
        message: data.message,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        roomId: data.roomId,
      };

      // Broadcast message to all users in the room (including sender)
      io.to(data.roomId).emit("chat-message", messageData);

      console.log(
        `Chat message from ${userInfo.userId} in room ${data.roomId}: ${data.message}`
      );
    }
  });

  // Handle audio toggle events
  socket.on("audio-toggled", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo && userInfo.roomId === data.roomId) {
      // Broadcast to all other users in the room
      socket.to(data.roomId).emit("user-audio-toggled", {
        socketId: socket.id,
        userId: userInfo.userId,
        enabled: data.enabled,
      });

      console.log(
        `Audio ${data.enabled ? "enabled" : "disabled"} by ${
          userInfo.userId
        } in room ${data.roomId}`
      );
    }
  });

  // Handle video toggle events
  socket.on("video-toggled", (data) => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo && userInfo.roomId === data.roomId) {
      // Broadcast to all other users in the room
      socket.to(data.roomId).emit("user-video-toggled", {
        socketId: socket.id,
        userId: userInfo.userId,
        enabled: data.enabled,
      });

      console.log(
        `Video ${data.enabled ? "enabled" : "disabled"} by ${
          userInfo.userId
        } in room ${data.roomId}`
      );
    }
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    const userInfo = connectedUsers.get(socket.id);
    if (userInfo) {
      const { userId, roomId } = userInfo;

      // Remove user from room
      if (rooms.has(roomId)) {
        rooms.get(roomId).delete(socket.id);

        // Remove room if empty
        if (rooms.get(roomId).size === 0) {
          rooms.delete(roomId);
        }
      }

      // Notify other users in the room
      socket.to(roomId).emit("user-left", { userId, socketId: socket.id });

      // Remove user from connected users
      connectedUsers.delete(socket.id);

      console.log(
        `User ${userId} disconnected from room ${roomId} (socket ${socket.id})`
      );
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});
