const express = require("express");
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"], // Ensure both transports are available
  allowEIO3: true, // Allow Engine.IO v3 clients
});

// Serve static files
app.use(express.static("public"));

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.get("/dashboard", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
});

app.get("/meeting-room", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "meeting-room.html"));
});

// Socket.IO connection handling
const rooms = new Map(); // Store room information
const userSockets = new Map(); // Map userId to socketId for reconnection

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join a meeting room
  socket.on("join-room", (data) => {
    try {
      const { roomId, userId, userName } = data;

      if (!roomId || !userId || !userName) {
        console.error("Invalid join-room data:", data);
        socket.emit("error", { message: "Invalid room data" });
        return;
      }

      console.log(
        `User ${userName} (${userId}) attempting to join room ${roomId}`
      );

      // Leave any existing rooms
      socket.rooms.forEach((room) => {
        if (room !== socket.id) {
          socket.leave(room);
        }
      });

      socket.join(roomId);

      // Initialize room if it doesn't exist
      if (!rooms.has(roomId)) {
        rooms.set(roomId, {
          participants: new Map(),
          messages: [],
          createdAt: new Date(),
        });
        console.log(`Created new room: ${roomId}`);
      }

      const room = rooms.get(roomId);

      // Store user socket mapping
      userSockets.set(userId, socket.id);

      // Add user to room participants
      room.participants.set(socket.id, {
        userId,
        userName,
        joinedAt: new Date(),
        isActive: true,
      });

      // Notify others in the room
      socket.to(roomId).emit("user-joined", {
        socketId: socket.id,
        userId,
        userName,
      });

      // Send current participants to the new user
      const participants = Array.from(room.participants.entries())
        .filter(([_, user]) => user.isActive)
        .map(([id, user]) => ({
          socketId: id,
          userId: user.userId,
          userName: user.userName,
        }));

      socket.emit("room-participants", participants);

      // Send chat history
      socket.emit("chat-history", room.messages);

      console.log(
        `User ${userName} successfully joined room ${roomId}. Total participants: ${room.participants.size}`
      );

      // Send confirmation to the user
      socket.emit("room-joined", {
        roomId,
        participants: participants.length,
        message: "Successfully joined the room",
      });
    } catch (error) {
      console.error("Error in join-room:", error);
      socket.emit("error", { message: "Failed to join room" });
    }
  });

  // WebRTC signaling - Offer
  socket.on("offer", (data) => {
    try {
      const { target, offer } = data;

      if (!target || !offer) {
        console.error("Invalid offer data:", data);
        return;
      }

      console.log(`Forwarding offer from ${socket.id} to ${target}`);

      // Check if target is still in the room
      const targetSocket = io.sockets.sockets.get(target);
      if (targetSocket) {
        targetSocket.emit("offer", {
          offer: offer,
          from: socket.id,
        });
      } else {
        console.warn(
          `Target socket ${target} not found for offer from ${socket.id}`
        );
      }
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  });

  // WebRTC signaling - Answer
  socket.on("answer", (data) => {
    try {
      const { target, answer } = data;

      if (!target || !answer) {
        console.error("Invalid answer data:", data);
        return;
      }

      console.log(`Forwarding answer from ${socket.id} to ${target}`);

      const targetSocket = io.sockets.sockets.get(target);
      if (targetSocket) {
        targetSocket.emit("answer", {
          answer: answer,
          from: socket.id,
        });
      } else {
        console.warn(
          `Target socket ${target} not found for answer from ${socket.id}`
        );
      }
    } catch (error) {
      console.error("Error handling answer:", error);
    }
  });

  // WebRTC signaling - ICE Candidate
  socket.on("ice-candidate", (data) => {
    try {
      const { target, candidate } = data;

      if (!target || !candidate) {
        console.error("Invalid ICE candidate data:", data);
        return;
      }

      console.log(`Forwarding ICE candidate from ${socket.id} to ${target}`);

      const targetSocket = io.sockets.sockets.get(target);
      if (targetSocket) {
        targetSocket.emit("ice-candidate", {
          candidate: candidate,
          from: socket.id,
        });
      } else {
        console.warn(
          `Target socket ${target} not found for ICE candidate from ${socket.id}`
        );
      }
    } catch (error) {
      console.error("Error handling ICE candidate:", error);
    }
  });

  // Chat messages
  socket.on("chat-message", (data) => {
    try {
      const { roomId, message, userName, userId } = data;

      if (!roomId || !message || !userName || !userId) {
        console.error("Invalid chat message data:", data);
        return;
      }

      if (rooms.has(roomId)) {
        const room = rooms.get(roomId);
        const chatMessage = {
          id: Date.now() + Math.random(), // Ensure unique ID
          message,
          userName,
          userId,
          timestamp: new Date().toISOString(),
        };

        room.messages.push(chatMessage);

        // Keep only last 100 messages to prevent memory issues
        if (room.messages.length > 100) {
          room.messages = room.messages.slice(-100);
        }

        // Broadcast to all users in the room
        io.to(roomId).emit("chat-message", chatMessage);

        console.log(
          `Chat message from ${userName} in room ${roomId}: ${message.substring(
            0,
            50
          )}...`
        );
      } else {
        console.warn(`Room ${roomId} not found for chat message`);
      }
    } catch (error) {
      console.error("Error handling chat message:", error);
    }
  });

  // Screen share signaling
  socket.on("screen-share-start", (data) => {
    try {
      const { roomId, userName } = data;

      if (!roomId || !userName) {
        console.error("Invalid screen share start data:", data);
        return;
      }

      console.log(`Screen share started by ${userName} in room ${roomId}`);

      socket.to(roomId).emit("screen-share-start", {
        from: socket.id,
        userName: userName,
      });
    } catch (error) {
      console.error("Error handling screen share start:", error);
    }
  });

  socket.on("screen-share-stop", (data) => {
    try {
      const { roomId } = data;

      if (!roomId) {
        console.error("Invalid screen share stop data:", data);
        return;
      }

      console.log(`Screen share stopped in room ${roomId}`);

      socket.to(roomId).emit("screen-share-stop", {
        from: socket.id,
      });
    } catch (error) {
      console.error("Error handling screen share stop:", error);
    }
  });

  // Ping/Pong for connection health
  socket.on("ping", () => {
    socket.emit("pong");
  });

  // Handle disconnection
  socket.on("disconnect", (reason) => {
    console.log(`User disconnected: ${socket.id}, reason: ${reason}`);

    // Remove user from all rooms they were in
    for (const [roomId, room] of rooms.entries()) {
      if (room.participants.has(socket.id)) {
        const user = room.participants.get(socket.id);

        // Mark user as inactive instead of immediately removing
        user.isActive = false;
        user.leftAt = new Date();

        console.log(`User ${user.userName} left room ${roomId}`);

        // Notify others in the room
        socket.to(roomId).emit("user-left", {
          socketId: socket.id,
          userName: user.userName,
          userId: user.userId,
        });

        // Clean up inactive users after a delay
        setTimeout(() => {
          if (room.participants.has(socket.id)) {
            const inactiveUser = room.participants.get(socket.id);
            if (!inactiveUser.isActive) {
              room.participants.delete(socket.id);
              console.log(
                `Removed inactive user ${inactiveUser.userName} from room ${roomId}`
              );
            }
          }

          // Clean up empty rooms
          if (room.participants.size === 0) {
            rooms.delete(roomId);
            console.log(`Room ${roomId} deleted (empty)`);
          }
        }, 30000); // Wait 30 seconds before cleanup

        break;
      }
    }

    // Remove from userSockets map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        break;
      }
    }
  });

  // Error handling
  socket.on("error", (error) => {
    console.error("Socket error:", error);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    rooms: rooms.size,
    connections: io.engine.clientsCount,
  });
});

// Room info endpoint
app.get("/api/rooms", (req, res) => {
  const roomInfo = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    participants: room.participants.size,
    createdAt: room.createdAt,
    messages: room.messages.length,
  }));

  res.json(roomInfo);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Video Call Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📋 Room info: http://localhost:${PORT}/api/rooms`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
