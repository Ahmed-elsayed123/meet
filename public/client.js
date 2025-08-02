class VideoCallApp {
  constructor() {
    this.socket = io();
    this.localStream = null;
    this.screenStream = null;
    this.peerConnections = {};
    this.remoteStreams = {};
    this.userId = null;
    this.roomId = null;
    this.roomType = "video";
    this.isVideoEnabled = true;
    this.isAudioEnabled = true;
    this.isScreenSharing = false;
    this.isChatOpen = false;

    this.initializeElements();
    this.setupEventListeners();
    this.setupSocketListeners();
  }

  initializeElements() {
    this.joinSection = document.getElementById("joinSection");
    this.videoSection = document.getElementById("videoSection");
    this.chatOnlySection = document.getElementById("chatOnlySection");
    this.userIdInput = document.getElementById("userId");
    this.roomIdInput = document.getElementById("roomId");
    this.joinBtn = document.getElementById("joinBtn");
    this.localVideo = document.getElementById("localVideo");
    this.videoGrid = document.getElementById("videoGrid");
    this.toggleVideoBtn = document.getElementById("toggleVideo");
    this.toggleAudioBtn = document.getElementById("toggleAudio");
    this.screenShareBtn = document.getElementById("screenShare");
    this.toggleChatBtn = document.getElementById("toggleChat");
    this.leaveBtn = document.getElementById("leaveBtn");
    this.connectionStatus = document.getElementById("connectionStatus");
    this.participantsList = document.getElementById("participantsList");
    this.currentRoomSpan = document.getElementById("currentRoom");
    this.participantCountSpan = document.getElementById("participantCount");
    this.statusDot = this.connectionStatus.querySelector(".status-dot");
    this.statusText = this.connectionStatus.querySelector(".status-text");

    // Chat elements
    this.chatPanel = document.getElementById("chatPanel");
    this.chatMessages = document.getElementById("chatMessages");
    this.chatInput = document.getElementById("chatInput");
    this.sendMessageBtn = document.getElementById("sendMessage");
    this.toggleChatArrowBtn = document.getElementById("toggleChatArrow");
    this.mainContent = document.querySelector(".main-content");

    // Chat-only elements
    this.chatOnlyMessages = document.getElementById("chatOnlyMessages");
    this.chatOnlyInput = document.getElementById("chatOnlyInput");
    this.sendChatOnlyMessageBtn = document.getElementById(
      "sendChatOnlyMessage"
    );
    this.leaveChatBtn = document.getElementById("leaveChatBtn");
    this.chatRoomName = document.getElementById("chatRoomName");
    this.chatParticipantCount = document.getElementById("chatParticipantCount");
  }

  setupEventListeners() {
    this.joinBtn.addEventListener("click", () => this.joinRoom());
    this.toggleVideoBtn.addEventListener("click", () => this.toggleVideo());
    this.toggleAudioBtn.addEventListener("click", () => this.toggleAudio());
    this.screenShareBtn.addEventListener("click", () =>
      this.toggleScreenShare()
    );
    this.toggleChatBtn.addEventListener("click", () => this.toggleChat());
    this.leaveBtn.addEventListener("click", () => this.leaveRoom());

    this.userIdInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.joinRoom();
    });

    this.roomIdInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") this.joinRoom();
    });

    // Chat event listeners
    this.sendMessageBtn.addEventListener("click", () => this.sendMessage());
    this.toggleChatArrowBtn.addEventListener("click", () => this.toggleChat());
    this.chatInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Chat-only event listeners
    this.sendChatOnlyMessageBtn.addEventListener("click", () =>
      this.sendChatOnlyMessage()
    );
    this.leaveChatBtn.addEventListener("click", () => this.leaveRoom());
    this.chatOnlyInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendChatOnlyMessage();
      }
    });

    // Add input validation for both chat inputs
    this.chatInput.addEventListener("input", () => {
      const message = this.chatInput.value;
      const remainingChars = 500 - message.length;

      // Update send button state
      this.sendMessageBtn.disabled =
        message.trim().length === 0 || remainingChars < 0;

      // Add visual feedback for character limit
      if (remainingChars < 50) {
        this.chatInput.style.borderColor =
          remainingChars < 0 ? "#ef4444" : "#f59e0b";
      } else {
        this.chatInput.style.borderColor = "#d1d5db";
      }
    });

    this.chatOnlyInput.addEventListener("input", () => {
      const message = this.chatOnlyInput.value;
      const remainingChars = 500 - message.length;

      // Update send button state
      this.sendChatOnlyMessageBtn.disabled =
        message.trim().length === 0 || remainingChars < 0;

      // Add visual feedback for character limit
      if (remainingChars < 50) {
        this.chatOnlyInput.style.borderColor =
          remainingChars < 0 ? "#ef4444" : "#f59e0b";
      } else {
        this.chatOnlyInput.style.borderColor = "#d1d5db";
      }
    });

    // Add keyboard shortcut to close chat with Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isChatOpen) {
        this.toggleChat();
      }

      // Debug audio issues with Ctrl+Shift+A
      if (e.ctrlKey && e.shiftKey && e.key === "A") {
        e.preventDefault();
        this.debugAudioIssues();
        console.log("Audio debug triggered manually");
      }

      // Test audio with Ctrl+Shift+T
      if (e.ctrlKey && e.shiftKey && e.key === "T") {
        e.preventDefault();
        this.testAudio();
        console.log("Audio test triggered manually");
      }

      // Force enable all audio with Ctrl+Shift+E
      if (e.ctrlKey && e.shiftKey && e.key === "E") {
        e.preventDefault();
        this.forceEnableAllAudio();
        console.log("Force enable audio triggered manually");
      }

      // Show audio status with Ctrl+Shift+S
      if (e.ctrlKey && e.shiftKey && e.key === "S") {
        e.preventDefault();
        this.showAudioStatus();
        console.log("Audio status triggered manually");
      }
    });

    // Add click outside chat panel to close it
    document.addEventListener("click", (e) => {
      if (
        this.isChatOpen &&
        !this.chatPanel.contains(e.target) &&
        !this.toggleChatBtn.contains(e.target)
      ) {
        this.toggleChat();
      }
    });

    // Zoom-inspired hover controls
    this.videoSection.addEventListener("mouseenter", () => {
      this.showControls();
    });

    this.videoSection.addEventListener("mouseleave", () => {
      this.hideControls();
    });

    // Add click handler to unlock audio (required for autoplay)
    this.videoSection.addEventListener("click", () => {
      this.initializeAudioContext();
      this.unlockAudio();
    });

    // Keep controls visible on mobile
    if (window.innerWidth <= 768) {
      this.showControls();
    }
  }

  showControls() {
    const controlsBar = document.querySelector(".controls-bar");
    if (controlsBar) {
      controlsBar.style.transform = "translateY(0)";
    }
  }

  hideControls() {
    const controlsBar = document.querySelector(".controls-bar");
    if (controlsBar && window.innerWidth > 768) {
      controlsBar.style.transform = "translateY(100%)";
    }
  }

  setupSocketListeners() {
    this.socket.on("connect", () => {
      this.statusText.textContent = "Connected";
      this.statusDot.classList.add("connected");
    });

    this.socket.on("disconnect", () => {
      this.statusText.textContent = "Disconnected";
      this.statusDot.classList.remove("connected");
    });

    this.socket.on("user-joined", (data) => {
      this.handleUserJoined(data);
    });

    this.socket.on("user-left", (data) => {
      this.handleUserLeft(data);
    });

    this.socket.on("room-participants", (participants) => {
      this.handleRoomParticipants(participants);
    });

    this.socket.on("offer", (data) => {
      this.handleOffer(data);
    });

    this.socket.on("answer", (data) => {
      this.handleAnswer(data);
    });

    this.socket.on("ice-candidate", (data) => {
      this.handleIceCandidate(data);
    });

    // Chat event listeners
    this.socket.on("chat-message", (data) => {
      this.handleChatMessage(data);
    });

    // Real-time status update listeners
    this.socket.on("user-audio-toggled", (data) => {
      this.handleUserAudioToggled(data);
    });

    this.socket.on("user-video-toggled", (data) => {
      this.handleUserVideoToggled(data);
    });
  }

  async joinRoom() {
    const userId = this.userIdInput.value.trim();
    const roomId = this.roomIdInput.value.trim();

    // Get selected room type
    const roomTypeInput = document.querySelector(
      'input[name="roomType"]:checked'
    );
    this.roomType = roomTypeInput ? roomTypeInput.value : "video";

    if (!userId) {
      alert("Please enter your name");
      return;
    }

    if (!roomId) {
      alert("Please enter a meeting ID");
      return;
    }

    this.userId = userId;
    this.roomId = roomId;

    // Handle different room types
    if (this.roomType === "chat") {
      // Chat-only room - no media access needed
      this.socket.emit("join-room", {
        userId,
        roomId,
        roomType: this.roomType,
      });

      this.joinSection.style.display = "none";
      this.chatOnlySection.style.display = "flex";

      this.chatRoomName.textContent = roomId;
      this.chatParticipantCount.textContent = "1 participant";

      // Initialize chat-only interface
      this.initializeChatOnly();
      return;
    }

    // Video or Audio room - need media access
    try {
      const mediaConstraints = {
        video: this.roomType === "video",
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(
        mediaConstraints
      );

      // Always set local video for both video and audio rooms
      // For audio rooms, we'll show a placeholder or avatar
      this.localVideo.srcObject = this.localStream;

      // For audio-only rooms, we can add a visual indicator
      if (this.roomType === "audio") {
        this.localVideo.style.opacity = "0.3"; // Dim the video for audio-only
      } else {
        this.localVideo.style.opacity = "1";
      }

      // Ensure local video can play audio
      this.localVideo.volume = 1.0;
      this.localVideo.muted = false;

      // Ensure local video plays when ready
      this.localVideo.addEventListener("loadedmetadata", () => {
        this.localVideo.play().catch((error) => {
          console.error("Error playing local video:", error);
        });
      });

      this.localVideo.addEventListener("canplay", () => {
        this.localVideo.play().catch((error) => {
          console.error("Error playing local video on canplay:", error);
        });
      });

      this.localVideo.addEventListener("loadeddata", () => {
        this.localVideo.play().catch((error) => {
          console.error("Error playing local video on loadeddata:", error);
        });
      });

      this.localVideo.addEventListener("playing", () => {
        console.log("Local video is now playing");
      });

      // Try to play immediately
      this.localVideo.play().catch((error) => {
        console.log("Could not play local video immediately:", error.message);
      });

      // Ensure local video plays on user interaction
      const playLocalVideo = () => {
        if (this.localVideo && this.localVideo.paused) {
          this.localVideo.play().catch((error) => {
            console.error("Error playing local video on interaction:", error);
          });
        }
      };

      document.addEventListener("click", playLocalVideo, { once: true });
      document.addEventListener("keydown", playLocalVideo, { once: true });
      document.addEventListener("touchstart", playLocalVideo, { once: true });

      this.socket.emit("join-room", {
        userId,
        roomId,
        roomType: this.roomType,
      });

      this.joinSection.style.display = "none";
      this.videoSection.style.display = "flex";
      this.videoSection.classList.add("active");

      // Hide video controls for audio-only rooms
      if (this.roomType === "audio") {
        this.toggleVideoBtn.style.display = "none";
        this.screenShareBtn.style.display = "none";
      } else {
        this.toggleVideoBtn.style.display = "flex";
        this.screenShareBtn.style.display = "flex";
      }

      this.currentRoomSpan.textContent = roomId;
      this.updateParticipantsList([userId]);
      this.updateParticipantCount(1);
      this.updateVideoGridLayout(1);

      // Initialize audio properly
      await this.initializeAudioProperly();

      // Request audio permissions
      await this.requestAudioPermissions();

      // Ensure all audio tracks are enabled
      this.forceEnableAllAudio();

      // Ensure chat is properly initialized
      this.initializeChat();
    } catch (error) {
      console.error("Error accessing media devices:", error);
      alert("Unable to access camera/microphone. Please check permissions.");
    }
  }

  // Initialize chat panel properly
  initializeChat() {
    console.log("Initializing chat panel...");

    // Clear any existing messages
    if (this.chatMessages) {
      this.chatMessages.innerHTML = "";
    }

    // Ensure chat panel is closed initially
    this.forceCloseChat();

    // Reset chat input
    if (this.chatInput) {
      this.chatInput.value = "";
    }

    // Add welcome message
    setTimeout(() => {
      this.addSystemMessage("Welcome to the meeting! Chat is ready.");
    }, 1000);

    // Add helpful tips
    setTimeout(() => {
      this.addSystemMessage("💡 Tip: Use Enter key to send messages quickly.");
    }, 3000);
  }

  // Initialize chat-only interface
  initializeChatOnly() {
    console.log("Initializing chat-only interface...");

    // Clear any existing messages
    if (this.chatOnlyMessages) {
      this.chatOnlyMessages.innerHTML = "";
    }

    // Reset chat input
    if (this.chatOnlyInput) {
      this.chatOnlyInput.value = "";
    }

    // Add welcome message
    this.addChatOnlySystemMessage("Welcome to the chat room!");
  }

  handleUserJoined(data) {
    console.log("User joined:", data);

    if (this.roomType !== "chat") {
      // Try to create peer connection with retry mechanism
      this.createPeerConnectionWithRetry(data.socketId, data.userId);
    }

    // Get current participants and add the new user
    const currentParticipants = this.getParticipantsList();
    const participants = [...currentParticipants, data.userId];

    // Make sure current user is included in the list
    if (!participants.includes(this.userId)) {
      participants.push(this.userId);
    }

    this.updateParticipantsList(participants);
    this.updateParticipantCount(participants.length);

    if (this.roomType !== "chat") {
      this.updateVideoGridLayout(participants.length);
    } else {
      this.updateChatOnlyParticipantCount(participants.length);
    }

    // Add system message to chat
    if (this.roomType === "chat") {
      this.addChatOnlySystemMessage(`${data.userId} joined the chat`);
    } else {
      this.addSystemMessage(`${data.userId} joined the meeting`);
    }

    // Debug audio issues after user joins
    setTimeout(() => {
      this.debugAudioIssues();
    }, 2000);
  }

  handleUserLeft(data) {
    console.log("User left:", data);
    console.log(
      "Current participants before removal:",
      this.getParticipantsList()
    );

    if (this.roomType !== "chat") {
      this.removePeerConnection(data.socketId);
      this.removeRemoteVideo(data.socketId);
    }

    // Get current participants and remove the leaving user
    const currentParticipants = this.getParticipantsList();
    const participants = currentParticipants.filter((p) => p !== data.userId);

    console.log("Participants after filtering:", participants);
    console.log("Current user ID:", this.userId);

    // Make sure current user is included in the list
    if (!participants.includes(this.userId)) {
      participants.push(this.userId);
      console.log("Added current user to participants list");
    }

    console.log("Final participants list:", participants);

    this.updateParticipantsList(participants);
    this.updateParticipantCount(participants.length);

    if (this.roomType !== "chat") {
      this.updateVideoGridLayout(participants.length);
    } else {
      this.updateChatOnlyParticipantCount(participants.length);
    }

    // Add system message to chat
    if (this.roomType === "chat") {
      this.addChatOnlySystemMessage(`${data.userId} left the chat`);
    } else {
      this.addSystemMessage(`${data.userId} left the meeting`);
    }
  }

  handleRoomParticipants(participants) {
    console.log("Room participants:", participants);

    // Add current user to the participants list
    const allParticipants = [...participants];
    if (!allParticipants.includes(this.userId)) {
      allParticipants.push(this.userId);
    }

    this.updateParticipantsList(allParticipants);
    this.updateParticipantCount(allParticipants.length);

    if (this.roomType !== "chat") {
      this.updateVideoGridLayout(allParticipants.length);
    } else {
      this.updateChatOnlyParticipantCount(allParticipants.length);
    }
  }

  // Zoom-inspired adaptive video grid layout
  updateVideoGridLayout(participantCount) {
    if (this.videoGrid) {
      // Set data attribute for CSS grid layout
      this.videoGrid.setAttribute("data-participants", participantCount);

      // Force a reflow to ensure the layout updates
      this.videoGrid.offsetHeight;

      console.log(
        `Updated video grid layout for ${participantCount} participants`
      );
    }
  }

  createPeerConnectionWithRetry(socketId, userId, retryCount = 0) {
    // Check if peer connection already exists
    if (this.peerConnections[socketId]) {
      console.log("Peer connection already exists for:", socketId);
      return;
    }

    // Ensure localStream is available before creating peer connection
    if (!this.localStream) {
      console.log(
        "Local stream not available, retrying in 500ms... (attempt " +
          (retryCount + 1) +
          "/10)"
      );
      if (retryCount < 10) {
        setTimeout(() => {
          this.createPeerConnectionWithRetry(socketId, userId, retryCount + 1);
        }, 500);
      } else {
        console.error(
          "Failed to create peer connection after 10 retries - local stream not available"
        );
      }
      return;
    }

    // If we have the stream, create the peer connection
    this.createPeerConnection(socketId, userId);
  }

  createPeerConnection(socketId, userId) {
    // Check if peer connection already exists
    if (this.peerConnections[socketId]) {
      console.log("Peer connection already exists for:", socketId);
      return;
    }

    // Ensure localStream is available before creating peer connection
    if (!this.localStream) {
      console.error(
        "Local stream not available, cannot create peer connection for:",
        userId
      );
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    this.peerConnections[socketId] = peerConnection;

    // Add local stream tracks to peer connection
    const currentStream = this.isScreenSharing
      ? this.screenStream
      : this.localStream;

    console.log("Adding tracks to peer connection for:", userId);
    console.log("Current stream tracks:", {
      audioTracks: currentStream.getAudioTracks().length,
      videoTracks: currentStream.getVideoTracks().length,
      isScreenSharing: this.isScreenSharing,
    });

    currentStream.getTracks().forEach((track) => {
      console.log(
        "Adding track:",
        track.kind,
        "Track ID:",
        track.id,
        "Enabled:",
        track.enabled
      );
      peerConnection.addTrack(track, currentStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          target: socketId,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      console.log(
        "Received remote track for:",
        userId,
        "Track kind:",
        event.track.kind
      );
      this.addRemoteVideo(socketId, userId, event.streams[0]);
    };

    // Create and send offer
    peerConnection
      .createOffer()
      .then((offer) => peerConnection.setLocalDescription(offer))
      .then(() => {
        this.socket.emit("offer", {
          target: socketId,
          offer: peerConnection.localDescription,
        });
      })
      .catch((error) => console.error("Error creating offer:", error));
  }

  async handleOffer(data) {
    // Check if peer connection already exists
    if (this.peerConnections[data.from]) {
      console.log("Peer connection already exists for:", data.from);
      return;
    }

    // Ensure localStream is available
    if (!this.localStream) {
      console.error(
        "Local stream not available, cannot handle offer from:",
        data.from
      );
      return;
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    this.peerConnections[data.from] = peerConnection;

    // Add local stream tracks
    const currentStream = this.isScreenSharing
      ? this.screenStream
      : this.localStream;

    console.log(
      "Adding tracks to peer connection (handleOffer) for:",
      data.fromUserId
    );
    console.log("Current stream tracks:", {
      audioTracks: currentStream.getAudioTracks().length,
      videoTracks: currentStream.getVideoTracks().length,
      isScreenSharing: this.isScreenSharing,
    });

    currentStream.getTracks().forEach((track) => {
      console.log(
        "Adding track (handleOffer):",
        track.kind,
        "Track ID:",
        track.id,
        "Enabled:",
        track.enabled
      );
      peerConnection.addTrack(track, currentStream);
    });

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.socket.emit("ice-candidate", {
          target: data.from,
          candidate: event.candidate,
        });
      }
    };

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      // Use the actual userId from the offer data
      const userId = data.fromUserId || `User-${data.from.slice(-4)}`;
      console.log(
        "Received remote track (handleOffer) for:",
        userId,
        "Track kind:",
        event.track.kind
      );
      this.addRemoteVideo(data.from, userId, event.streams[0]);
    };

    // Set remote description and create answer
    try {
      await peerConnection.setRemoteDescription(data.offer);

      // Process any pending ICE candidates
      await this.processPendingIceCandidates(peerConnection);

      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      this.socket.emit("answer", {
        target: data.from,
        answer: peerConnection.localDescription,
      });
    } catch (error) {
      console.error("Error handling offer:", error);
    }
  }

  async handleAnswer(data) {
    const peerConnection = this.peerConnections[data.from];
    if (peerConnection) {
      try {
        await peerConnection.setRemoteDescription(data.answer);

        // Process any pending ICE candidates
        await this.processPendingIceCandidates(peerConnection);
      } catch (error) {
        console.error("Error handling answer:", error);
      }
    }
  }

  async handleIceCandidate(data) {
    const peerConnection = this.peerConnections[data.from];
    if (peerConnection) {
      try {
        // Check if remote description is set before adding ICE candidate
        if (
          peerConnection.remoteDescription &&
          peerConnection.remoteDescription.type
        ) {
          await peerConnection.addIceCandidate(data.candidate);
        } else {
          // Store ICE candidate for later if remote description is not set yet
          if (!peerConnection.pendingCandidates) {
            peerConnection.pendingCandidates = [];
          }
          peerConnection.pendingCandidates.push(data.candidate);
          console.log(
            "Stored ICE candidate for later, remote description not set yet"
          );
        }
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    }
  }

  async processPendingIceCandidates(peerConnection) {
    if (
      peerConnection.pendingCandidates &&
      peerConnection.pendingCandidates.length > 0
    ) {
      console.log(
        "Processing pending ICE candidates:",
        peerConnection.pendingCandidates.length
      );
      for (const candidate of peerConnection.pendingCandidates) {
        try {
          await peerConnection.addIceCandidate(candidate);
        } catch (error) {
          console.error("Error adding pending ICE candidate:", error);
        }
      }
      peerConnection.pendingCandidates = [];
    }
  }

  addRemoteVideo(socketId, userId, stream) {
    // Check if remote video already exists
    if (this.remoteStreams[socketId]) {
      console.log("Remote video already exists for:", socketId);
      return;
    }

    // Create video container
    const videoContainer = document.createElement("div");
    videoContainer.className = "video-container";
    videoContainer.id = `remote-${socketId}`;

    // Create video element
    const video = document.createElement("video");
    video.autoplay = true;
    video.playsinline = true;
    video.muted = false; // Ensure audio is not muted
    video.srcObject = stream;

    // For audio-only rooms, dim the video
    if (this.roomType === "audio") {
      video.style.opacity = "0.3";
    }

    // Create overlay
    const overlay = document.createElement("div");
    overlay.className = "video-overlay";

    // Create label
    const label = document.createElement("div");
    label.className = "video-label";
    label.textContent = userId;

    // Create status icons
    const status = document.createElement("div");
    status.className = "video-status";
    status.innerHTML =
      '<i class="fas fa-microphone status-icon audio-status"></i><i class="fas fa-video status-icon video-status"></i>';

    // Assemble overlay
    overlay.appendChild(label);
    overlay.appendChild(status);

    // Assemble container
    videoContainer.appendChild(video);
    videoContainer.appendChild(overlay);

    // Add to grid
    this.videoGrid.appendChild(videoContainer);

    // Store reference
    this.remoteStreams[socketId] = { videoContainer, userId, stream };

    // Ensure audio is enabled for remote streams
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length > 0) {
      // Enable the audio track
      audioTracks[0].enabled = true;
      console.log(
        "Audio track enabled for:",
        userId,
        "Track ID:",
        audioTracks[0].id,
        "Enabled:",
        audioTracks[0].enabled
      );

      // Update audio status icon
      const audioIcon = status.querySelector(".audio-status");
      if (audioIcon) {
        audioIcon.classList.toggle("muted", !audioTracks[0].enabled);
      }

      // Ensure video element can play audio by setting volume
      video.volume = 1.0;
      console.log("Set video volume to 1.0 for:", userId);
    } else {
      console.log("No audio tracks found for:", userId);
      // Update audio status icon to show muted
      const audioIcon = status.querySelector(".audio-status");
      if (audioIcon) {
        audioIcon.classList.add("muted");
      }
    }

    // Ensure video element can play audio
    video.addEventListener("loadedmetadata", () => {
      console.log("Video metadata loaded for:", userId);

      // Set volume and ensure audio is enabled
      video.volume = 1.0;
      video.muted = false;

      // Force play with user interaction
      const playVideo = () => {
        video.play().catch((error) => {
          console.error("Error playing video for:", userId, error);
        });
      };

      // Try to play immediately
      playVideo();

      // Also try on user interaction
      document.addEventListener("click", playVideo, { once: true });
    });

    // Additional event listener for when video starts playing
    video.addEventListener("playing", () => {
      console.log("Video started playing for:", userId);
      // Double-check audio settings
      video.volume = 1.0;
      video.muted = false;
    });

    // Add canplay event listener
    video.addEventListener("canplay", () => {
      console.log("Video can play for:", userId);
      video.volume = 1.0;
      video.muted = false;
    });

    // Add loadeddata event listener
    video.addEventListener("loadeddata", () => {
      console.log("Video data loaded for:", userId);
      video.volume = 1.0;
      video.muted = false;
    });

    // Log stream information
    console.log("Stream info for:", userId, {
      audioTracks: stream.getAudioTracks().length,
      videoTracks: stream.getVideoTracks().length,
      streamId: stream.id,
    });

    // Update grid layout after adding new video
    const participantCount = this.getParticipantsList().length;
    this.updateVideoGridLayout(participantCount);
  }

  removeRemoteVideo(socketId) {
    const remoteVideo = this.remoteStreams[socketId];
    if (remoteVideo) {
      console.log("Removing remote video for:", socketId);

      // Remove the video container from DOM
      if (remoteVideo.videoContainer && remoteVideo.videoContainer.parentNode) {
        remoteVideo.videoContainer.parentNode.removeChild(
          remoteVideo.videoContainer
        );
      }

      // Stop all tracks in the stream
      if (remoteVideo.stream) {
        remoteVideo.stream.getTracks().forEach((track) => {
          track.stop();
        });
      }

      // Remove from remote streams
      delete this.remoteStreams[socketId];

      // Force refresh the video grid layout
      this.refreshVideoGrid();

      // Also remove any video elements with this socket ID
      const videoElements = document.querySelectorAll(
        `[data-socket-id="${socketId}"]`
      );
      videoElements.forEach((element) => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
    }
  }

  removePeerConnection(socketId) {
    const peerConnection = this.peerConnections[socketId];
    if (peerConnection) {
      console.log("Removing peer connection for:", socketId);

      // Close the peer connection
      peerConnection.close();

      // Remove from peer connections
      delete this.peerConnections[socketId];
    }
  }

  async toggleScreenShare() {
    if (this.isScreenSharing) {
      await this.stopScreenShare();
    } else {
      await this.startScreenShare();
    }
  }

  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: "always",
        },
        audio: false,
      });

      // Update local video to show screen
      this.localVideo.srcObject = this.screenStream;
      this.isScreenSharing = true;

      // Update button state
      this.screenShareBtn.classList.add("active");
      this.screenShareBtn.querySelector(".control-text").textContent =
        "Stop Sharing";

      // Replace tracks in all peer connections
      this.replaceTracksInAllConnections();

      // Handle screen share stop
      this.screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };
    } catch (error) {
      console.error("Error starting screen share:", error);
      alert("Unable to start screen sharing. Please try again.");
    }
  }

  async stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach((track) => track.stop());
      this.screenStream = null;
    }

    // Restore local video
    this.localVideo.srcObject = this.localStream;
    this.isScreenSharing = false;

    // Update button state
    this.screenShareBtn.classList.remove("active");
    this.screenShareBtn.querySelector(".control-text").textContent =
      "Share Screen";

    // Replace tracks in all peer connections
    this.replaceTracksInAllConnections();
  }

  replaceTracksInAllConnections() {
    // Only replace tracks for outgoing connections (where we initiated the connection)
    // This prevents affecting incoming streams from other participants
    Object.keys(this.peerConnections).forEach((socketId) => {
      const peerConnection = this.peerConnections[socketId];
      const senders = peerConnection.getSenders();

      senders.forEach((sender) => {
        // Only replace video tracks that we're sending (outgoing)
        if (
          sender.track &&
          sender.track.kind === "video" &&
          sender.track.id.includes("local")
        ) {
          const currentStream = this.isScreenSharing
            ? this.screenStream
            : this.localStream;
          const videoTrack = currentStream.getVideoTracks()[0];
          if (videoTrack) {
            console.log(
              "Replacing video track for:",
              socketId,
              "New track ID:",
              videoTrack.id
            );
            sender.replaceTrack(videoTrack);
          }
        }
        // Ensure audio tracks are maintained and enabled
        if (sender.track && sender.track.kind === "audio") {
          console.log(
            "Audio track found for:",
            socketId,
            "Track ID:",
            sender.track.id,
            "Enabled:",
            sender.track.enabled
          );
          // Make sure audio track is enabled
          if (sender.track.enabled !== this.isAudioEnabled) {
            sender.track.enabled = this.isAudioEnabled;
            console.log(
              "Updated audio track enabled state for:",
              socketId,
              "to:",
              this.isAudioEnabled
            );
          }
        }
      });
    });
  }

  toggleVideo() {
    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      this.isVideoEnabled = videoTrack.enabled;

      this.toggleVideoBtn.classList.toggle("muted", !this.isVideoEnabled);
      this.toggleVideoBtn.querySelector(".control-text").textContent = this
        .isVideoEnabled
        ? "Video"
        : "Video Off";

      // Emit video toggle event to other participants
      this.socket.emit("video-toggled", {
        roomId: this.roomId,
        socketId: this.socket.id,
        userId: this.userId,
        enabled: this.isVideoEnabled,
      });

      // Update local video overlay
      this.refreshLocalVideoOverlay();
    }
  }

  toggleAudio() {
    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      this.isAudioEnabled = audioTrack.enabled;

      this.toggleAudioBtn.classList.toggle("muted", !this.isAudioEnabled);
      this.toggleAudioBtn.querySelector(".control-text").textContent = this
        .isAudioEnabled
        ? "Audio"
        : "Audio Off";

      // Emit audio toggle event to other participants
      this.socket.emit("audio-toggled", {
        roomId: this.roomId,
        socketId: this.socket.id,
        userId: this.userId,
        enabled: this.isAudioEnabled,
      });

      // Update local video overlay
      this.refreshLocalVideoOverlay();
    }
  }

  // Chat functionality
  toggleChat() {
    console.log("Toggle chat called. Current state:", this.isChatOpen);

    this.isChatOpen = !this.isChatOpen;
    console.log("New state:", this.isChatOpen);

    if (this.isChatOpen) {
      console.log("Opening chat panel");
      this.chatPanel.classList.add("open");
      this.mainContent.classList.add("chat-open");
      this.toggleChatBtn.classList.add("active");

      // Focus on chat input after a short delay to ensure panel is visible
      setTimeout(() => {
        this.chatInput.focus();
      }, 100);

      // Add visual indicator
      this.toggleChatBtn.style.background = "#10b981";

      // Add a welcome message when opening
      setTimeout(() => {
        this.addSystemMessage("Chat is now active. Type your message below.");
      }, 200);
    } else {
      console.log("Closing chat panel");
      this.chatPanel.classList.remove("open");
      this.mainContent.classList.remove("chat-open");
      this.toggleChatBtn.classList.remove("active");

      // Remove visual indicator
      this.toggleChatBtn.style.background = "";

      // Ensure chat panel is completely hidden after transition
      setTimeout(() => {
        if (!this.isChatOpen) {
          this.chatPanel.style.opacity = "0";
          this.chatPanel.style.pointerEvents = "none";
          this.chatPanel.style.right = "-320px";
        }
      }, 300);
    }

    // Force a reflow to ensure the transition works
    this.chatPanel.offsetHeight;
  }

  sendMessage() {
    const message = this.chatInput.value.trim();
    if (!message || !this.roomId) {
      console.log("Cannot send message: empty message or no room");
      return;
    }

    // Validate message length
    if (message.length > 500) {
      alert("Message too long. Please keep it under 500 characters.");
      return;
    }

    console.log("Sending message:", message);

    // Send message to server
    this.socket.emit("send-message", {
      roomId: this.roomId,
      message: message,
      userId: this.userId,
    });

    // Clear input
    this.chatInput.value = "";

    // Disable send button temporarily to prevent spam
    this.sendMessageBtn.disabled = true;
    setTimeout(() => {
      this.sendMessageBtn.disabled = false;
    }, 1000);
  }

  handleChatMessage(data) {
    console.log("Received chat message:", data);
    const isOwnMessage = data.userId === this.userId;

    // Handle message based on room type
    if (this.roomType === "chat") {
      this.addChatOnlyMessage(
        data.userId,
        data.message,
        data.timestamp,
        isOwnMessage
      );
    } else {
      this.addChatMessage(
        data.userId,
        data.message,
        data.timestamp,
        isOwnMessage
      );
    }
  }

  addChatMessage(sender, message, timestamp, isOwn = false) {
    const messageElement = document.createElement("div");
    messageElement.className = `chat-message ${isOwn ? "own" : "other"}`;

    const messageHeader = document.createElement("div");
    messageHeader.className = "message-header";

    const senderElement = document.createElement("span");
    senderElement.className = "message-sender";
    senderElement.textContent = sender;

    const timeElement = document.createElement("span");
    timeElement.className = "message-time";
    timeElement.textContent =
      timestamp ||
      new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.textContent = message;

    messageHeader.appendChild(senderElement);
    messageHeader.appendChild(timeElement);
    messageElement.appendChild(messageHeader);
    messageElement.appendChild(messageContent);

    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();

    // Add a subtle notification sound for new messages (optional)
    if (!isOwn) {
      this.playNotificationSound();
    }
  }

  addSystemMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "chat-message system";
    messageElement.style.alignSelf = "center";
    messageElement.style.maxWidth = "100%";

    const messageContent = document.createElement("div");
    messageContent.className = "message-content";
    messageContent.style.background = "#f1f5f9";
    messageContent.style.color = "#64748b";
    messageContent.style.fontSize = "12px";
    messageContent.style.fontStyle = "italic";
    messageContent.textContent = message;

    messageElement.appendChild(messageContent);
    this.chatMessages.appendChild(messageElement);
    this.scrollToBottom();
  }

  // Chat-only message methods
  sendChatOnlyMessage() {
    const message = this.chatOnlyInput.value.trim();
    if (!message || !this.roomId) {
      console.log("Cannot send message: empty message or no room");
      return;
    }

    // Validate message length
    if (message.length > 500) {
      alert("Message too long. Please keep it under 500 characters.");
      return;
    }

    console.log("Sending chat-only message:", message);

    // Send message to server
    this.socket.emit("send-message", {
      roomId: this.roomId,
      message: message,
      userId: this.userId,
    });

    // Clear input
    this.chatOnlyInput.value = "";

    // Disable send button temporarily to prevent spam
    this.sendChatOnlyMessageBtn.disabled = true;
    setTimeout(() => {
      this.sendChatOnlyMessageBtn.disabled = false;
    }, 1000);
  }

  addChatOnlyMessage(sender, message, timestamp, isOwn = false) {
    const messageElement = document.createElement("div");
    messageElement.className = `message ${isOwn ? "own" : "other"}`;

    const messageBubble = document.createElement("div");
    messageBubble.className = "message-bubble";

    const senderElement = document.createElement("div");
    senderElement.className = "message-sender";
    senderElement.textContent = sender;

    const messageText = document.createElement("div");
    messageText.textContent = message;

    const timeElement = document.createElement("div");
    timeElement.className = "message-time";
    timeElement.textContent = new Date(timestamp).toLocaleTimeString();

    messageBubble.appendChild(senderElement);
    messageBubble.appendChild(messageText);
    messageBubble.appendChild(timeElement);
    messageElement.appendChild(messageBubble);

    this.chatOnlyMessages.appendChild(messageElement);
    this.scrollChatOnlyToBottom();
  }

  addChatOnlySystemMessage(message) {
    const messageElement = document.createElement("div");
    messageElement.className = "system-message";
    messageElement.textContent = message;

    this.chatOnlyMessages.appendChild(messageElement);
    this.scrollChatOnlyToBottom();
  }

  scrollChatOnlyToBottom() {
    if (this.chatOnlyMessages) {
      this.chatOnlyMessages.scrollTop = this.chatOnlyMessages.scrollHeight;
    }
  }

  scrollToBottom() {
    // Smooth scroll to bottom
    this.chatMessages.scrollTo({
      top: this.chatMessages.scrollHeight,
      behavior: "smooth",
    });
  }

  // Optional: Add notification sound for new messages
  playNotificationSound() {
    // Create a simple notification sound
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1);

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.2
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  }

  // Method to initialize audio context (helps with audio issues)
  initializeAudioContext() {
    try {
      // Create audio context to unlock audio
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      // Resume audio context if suspended
      if (audioContext.state === "suspended") {
        audioContext.resume().then(() => {
          console.log("Audio context resumed successfully");
        });
      }

      // Create a silent oscillator to unlock audio
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set gain to 0 (silent)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.001);

      console.log("Audio context initialized successfully");
    } catch (error) {
      console.error("Error initializing audio context:", error);
    }
  }

  // Method to force close chat panel
  forceCloseChat() {
    console.log("Force closing chat panel");
    this.isChatOpen = false;
    this.chatPanel.classList.remove("open");
    this.mainContent.classList.remove("chat-open");
    this.toggleChatBtn.classList.remove("active");

    // Force hide the chat panel completely off-screen
    this.chatPanel.style.opacity = "0";
    this.chatPanel.style.pointerEvents = "none";
    this.chatPanel.style.right = "-320px";
  }

  leaveRoom() {
    // Stop screen share if active
    if (this.isScreenSharing) {
      this.stopScreenShare();
    }

    // Force close chat panel
    this.forceCloseChat();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
    }

    // Close all peer connections
    Object.keys(this.peerConnections).forEach((socketId) => {
      this.removePeerConnection(socketId);
    });

    // Remove all remote videos
    Object.keys(this.remoteStreams).forEach((socketId) => {
      this.removeRemoteVideo(socketId);
    });

    // Reset UI based on room type
    this.joinSection.style.display = "flex";
    this.videoSection.style.display = "none";
    this.videoSection.classList.remove("active");
    this.chatOnlySection.style.display = "none";

    // Reset control visibility
    this.toggleVideoBtn.style.display = "flex";
    this.screenShareBtn.style.display = "flex";

    this.userIdInput.value = "";
    this.roomIdInput.value = "";
    this.localVideo.srcObject = null;

    // Reset controls
    this.toggleVideoBtn.classList.remove("muted");
    this.toggleAudioBtn.classList.remove("muted");
    this.screenShareBtn.classList.remove("active");
    this.toggleChatBtn.classList.remove("active");
    this.toggleVideoBtn.querySelector(".control-text").textContent = "Video";
    this.toggleAudioBtn.querySelector(".control-text").textContent = "Audio";
    this.screenShareBtn.querySelector(".control-text").textContent =
      "Share Screen";

    // Clear participants
    this.updateParticipantsList([]);
    this.updateParticipantCount(0);
    this.updateVideoGridLayout(0);
    this.currentRoomSpan.textContent = "-";

    // Clear chat messages completely
    if (this.chatMessages) {
      this.chatMessages.innerHTML = "";
    }

    // Reset all state variables
    this.userId = null;
    this.roomId = null;
    this.localStream = null;
    this.screenStream = null;
    this.isScreenSharing = false;
    this.isChatOpen = false;

    // Clear any existing peer connections and remote streams
    this.peerConnections = {};
    this.remoteStreams = {};
  }

  getParticipantsList() {
    const items = this.participantsList.querySelectorAll(".participant-item");
    return Array.from(items).map(
      (item) => item.querySelector(".participant-name").textContent
    );
  }

  updateParticipantsList(participants) {
    this.participantsList.innerHTML = "";
    participants.forEach((participant) => {
      const participantItem = document.createElement("div");
      participantItem.className = "participant-item";

      const avatar = document.createElement("div");
      avatar.className = "participant-avatar";
      avatar.textContent = participant.charAt(0).toUpperCase();

      const name = document.createElement("div");
      name.className = "participant-name";
      name.textContent = participant;

      participantItem.appendChild(avatar);
      participantItem.appendChild(name);
      this.participantsList.appendChild(participantItem);
    });
  }

  updateParticipantCount(count) {
    this.participantCountSpan.textContent = count;
  }

  updateChatOnlyParticipantCount(count) {
    const text = count === 1 ? "1 participant" : `${count} participants`;
    this.chatParticipantCount.textContent = text;
  }

  handleUserAudioToggled(data) {
    console.log("User audio toggled:", data);
    const remoteVideo = this.remoteStreams[data.socketId];
    if (remoteVideo) {
      const audioIcon =
        remoteVideo.videoContainer.querySelector(".audio-status");
      if (audioIcon) {
        audioIcon.classList.toggle("muted", !data.enabled);
      }
    }
  }

  handleUserVideoToggled(data) {
    console.log("User video toggled:", data);
    const remoteVideo = this.remoteStreams[data.socketId];
    if (remoteVideo) {
      const videoIcon =
        remoteVideo.videoContainer.querySelector(".video-status");
      if (videoIcon) {
        videoIcon.classList.toggle("muted", !data.enabled);
      }
    }
  }

  // Method to refresh local video overlay
  refreshLocalVideoOverlay() {
    const localVideoContainer = document.querySelector(
      ".video-container.main-video"
    );
    if (localVideoContainer) {
      const audioIcon = localVideoContainer.querySelector(".audio-status");
      const videoIcon = localVideoContainer.querySelector(".video-status");

      if (audioIcon) {
        audioIcon.classList.toggle("muted", !this.isAudioEnabled);
      }

      if (videoIcon) {
        videoIcon.classList.toggle("muted", !this.isVideoEnabled);
      }
    }
  }

  // Method to refresh video grid layout
  refreshVideoGrid() {
    // Force a reflow to ensure proper layout
    this.videoGrid.offsetHeight;

    // Update the grid layout based on current participant count
    const participantCount = this.getParticipantsList().length;
    this.updateVideoGridLayout(participantCount);

    console.log("Video grid refreshed with", participantCount, "participants");
  }

  // Method to debug and fix audio issues
  debugAudioIssues() {
    console.log("=== Audio Debug Information ===");

    // Check local stream
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      console.log("Local audio tracks:", audioTracks.length);
      audioTracks.forEach((track, index) => {
        console.log(`Local audio track ${index}:`, {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        });
      });
    }

    // Check remote streams
    Object.keys(this.remoteStreams).forEach((socketId) => {
      const remoteStream = this.remoteStreams[socketId];
      const audioTracks = remoteStream.stream.getAudioTracks();
      console.log(
        `Remote audio tracks for ${remoteStream.userId}:`,
        audioTracks.length
      );
      audioTracks.forEach((track, index) => {
        console.log(`Remote audio track ${index} for ${remoteStream.userId}:`, {
          id: track.id,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
        });
      });
    });

    // Check peer connections
    Object.keys(this.peerConnections).forEach((socketId) => {
      const pc = this.peerConnections[socketId];
      const senders = pc.getSenders();
      console.log(`Peer connection ${socketId} senders:`, senders.length);
      senders.forEach((sender, index) => {
        if (sender.track) {
          console.log(`Sender ${index} track:`, {
            kind: sender.track.kind,
            id: sender.track.id,
            enabled: sender.track.enabled,
            readyState: sender.track.readyState,
          });
        }
      });
    });

    // Try to fix common audio issues
    this.fixAudioIssues();
  }

  // Method to fix common audio issues
  fixAudioIssues() {
    console.log("=== Attempting to fix audio issues ===");

    // Fix remote stream audio
    Object.keys(this.remoteStreams).forEach((socketId) => {
      const remoteStream = this.remoteStreams[socketId];
      const videoElement = remoteStream.videoContainer.querySelector("video");

      if (videoElement) {
        // Ensure video element can play audio
        videoElement.volume = 1.0;
        videoElement.muted = false;

        // Force play the video
        videoElement.play().catch((error) => {
          console.log(
            `Could not auto-play video for ${remoteStream.userId}:`,
            error
          );
        });
      }

      // Enable all audio tracks
      const audioTracks = remoteStream.stream.getAudioTracks();
      audioTracks.forEach((track) => {
        if (!track.enabled) {
          track.enabled = true;
          console.log(`Enabled audio track for ${remoteStream.userId}`);
        }
      });
    });

    // Ensure local audio is enabled
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        if (!track.enabled) {
          track.enabled = true;
          console.log("Enabled local audio track");
        }
      });
    }
  }

  // Enhanced audio initialization method
  async initializeAudioProperly() {
    console.log("=== Initializing Audio Properly ===");

    try {
      // Create and resume audio context
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();

      if (audioContext.state === "suspended") {
        await audioContext.resume();
        console.log("Audio context resumed successfully");
      }

      // Create a silent oscillator to unlock audio
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Set gain to 0 (silent)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.001);

      console.log("Audio context initialized successfully");

      // Force user interaction for audio
      document.addEventListener(
        "click",
        () => {
          this.unlockAudio();
        },
        { once: true }
      );
    } catch (error) {
      console.error("Error initializing audio context:", error);
    }
  }

  // Method to unlock audio after user interaction
  unlockAudio() {
    console.log("=== Unlocking Audio ===");

    // Force play all video elements to unlock audio
    const allVideos = document.querySelectorAll("video");
    allVideos.forEach((video) => {
      video.volume = 1.0;
      video.muted = false;

      // Try to play the video
      video.play().catch((error) => {
        console.log("Could not auto-play video:", error);
      });
    });

    // Enable all audio tracks
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = true;
        console.log("Enabled local audio track");
      });
    }

    // Enable all remote audio tracks
    Object.keys(this.remoteStreams).forEach((socketId) => {
      const remoteStream = this.remoteStreams[socketId];
      const audioTracks = remoteStream.stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = true;
        console.log(`Enabled remote audio track for ${remoteStream.userId}`);
      });
    });
  }

  // Enhanced method to handle audio permissions
  async requestAudioPermissions() {
    try {
      console.log("Requesting audio permissions...");

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());

      console.log("Audio permissions granted");
      return true;
    } catch (error) {
      console.error("Audio permissions denied:", error);
      alert("Please allow microphone access for audio to work properly.");
      return false;
    }
  }

  // Method to test audio functionality
  testAudio() {
    console.log("=== Testing Audio ===");

    // Check if we have any remote streams
    const remoteStreamCount = Object.keys(this.remoteStreams).length;
    console.log(`Remote streams: ${remoteStreamCount}`);

    if (remoteStreamCount === 0) {
      console.log("No remote streams to test audio with");
      return;
    }

    // Test each remote stream
    Object.keys(this.remoteStreams).forEach((socketId) => {
      const remoteStream = this.remoteStreams[socketId];
      const videoElement = remoteStream.videoContainer.querySelector("video");

      if (videoElement) {
        console.log(`Testing audio for ${remoteStream.userId}:`);
        console.log(`- Video muted: ${videoElement.muted}`);
        console.log(`- Video volume: ${videoElement.volume}`);
        console.log(`- Video readyState: ${videoElement.readyState}`);
        console.log(`- Video paused: ${videoElement.paused}`);

        // Check audio tracks
        const audioTracks = remoteStream.stream.getAudioTracks();
        console.log(`- Audio tracks: ${audioTracks.length}`);
        audioTracks.forEach((track, index) => {
          console.log(
            `  Track ${index}: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`
          );
        });
      }
    });

    // Test local stream
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      console.log(`Local audio tracks: ${audioTracks.length}`);
      audioTracks.forEach((track, index) => {
        console.log(
          `  Track ${index}: enabled=${track.enabled}, muted=${track.muted}, readyState=${track.readyState}`
        );
      });
    }
  }

  // Method to force enable all audio
  forceEnableAllAudio() {
    console.log("=== Force Enabling All Audio ===");

    // Enable local audio
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = true;
        console.log("Forced enabled local audio track");
      });
    }

    // Enable all remote audio
    Object.keys(this.remoteStreams).forEach((socketId) => {
      const remoteStream = this.remoteStreams[socketId];
      const videoElement = remoteStream.videoContainer.querySelector("video");

      if (videoElement) {
        videoElement.volume = 1.0;
        videoElement.muted = false;
        console.log(`Forced enabled audio for ${remoteStream.userId}`);
      }

      const audioTracks = remoteStream.stream.getAudioTracks();
      audioTracks.forEach((track) => {
        track.enabled = true;
        console.log(
          `Forced enabled remote audio track for ${remoteStream.userId}`
        );
      });
    });
  }

  // Method to show audio status to user
  showAudioStatus() {
    const remoteStreamCount = Object.keys(this.remoteStreams).length;
    const localAudioTracks = this.localStream
      ? this.localStream.getAudioTracks().length
      : 0;

    let statusMessage = `Audio Status:\n`;
    statusMessage += `- Local audio tracks: ${localAudioTracks}\n`;
    statusMessage += `- Remote streams: ${remoteStreamCount}\n`;

    if (remoteStreamCount > 0) {
      Object.keys(this.remoteStreams).forEach((socketId) => {
        const remoteStream = this.remoteStreams[socketId];
        const audioTracks = remoteStream.stream.getAudioTracks();
        const enabledTracks = audioTracks.filter(
          (track) => track.enabled
        ).length;
        statusMessage += `- ${remoteStream.userId}: ${enabledTracks}/${audioTracks.length} audio tracks enabled\n`;
      });
    }

    console.log(statusMessage);
    alert(statusMessage);
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new VideoCallApp();
});
