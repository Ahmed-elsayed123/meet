# Video Call Server - Node.js + Socket.IO

This is the signaling server for the video call application, built with Node.js and Socket.IO to handle WebRTC peer-to-peer connections.

## 🚀 Quick Start

### Prerequisites

- Node.js 14.0.0 or higher
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the server
npm start

# For development with auto-restart
npm run dev
```

### Alternative Startup

```bash
# Using the startup script
node start.js

# Or directly
node server.js
```

## 📡 Server Features

### WebRTC Signaling

- **Offer/Answer Exchange**: Handles WebRTC SDP offer and answer exchange
- **ICE Candidate Relay**: Forwards ICE candidates between peers
- **Connection Management**: Tracks active connections and handles disconnections

### Room Management

- **Dynamic Room Creation**: Rooms are created automatically when users join
- **Participant Tracking**: Monitors active participants in each room
- **Graceful Cleanup**: Removes inactive users and empty rooms

### Real-time Communication

- **Chat System**: Handles text messages in meeting rooms
- **Screen Sharing**: Manages screen share start/stop events
- **Connection Health**: Ping/pong for connection monitoring

## 🔧 Configuration

### Environment Variables

```bash
PORT=3000                    # Server port (default: 3000)
NODE_ENV=production          # Environment mode
```

### Socket.IO Configuration

- **Transports**: WebSocket and polling fallback
- **CORS**: Enabled for all origins (configure for production)
- **Engine.IO v3**: Backward compatibility enabled

## 📊 API Endpoints

### Health Check

```bash
GET /health
```

Returns server status and connection count.

### Room Information

```bash
GET /api/rooms
```

Returns list of active rooms and participant counts.

## 🔌 Socket.IO Events

### Client to Server

- `join-room`: Join a meeting room
- `offer`: Send WebRTC offer
- `answer`: Send WebRTC answer
- `ice-candidate`: Send ICE candidate
- `chat-message`: Send chat message
- `screen-share-start`: Start screen sharing
- `screen-share-stop`: Stop screen sharing
- `ping`: Connection health check

### Server to Client

- `user-joined`: New user joined the room
- `user-left`: User left the room
- `room-participants`: List of current participants
- `room-joined`: Confirmation of room join
- `offer`: Receive WebRTC offer
- `answer`: Receive WebRTC answer
- `ice-candidate`: Receive ICE candidate
- `chat-message`: Receive chat message
- `chat-history`: Room chat history
- `screen-share-start`: Screen share started
- `screen-share-stop`: Screen share stopped
- `pong`: Connection health response
- `error`: Error messages

## 🛡️ Error Handling

### Connection Errors

- Invalid room data validation
- Missing target socket handling
- Graceful disconnection handling
- Automatic cleanup of inactive users

### Data Validation

- Required field validation for all events
- Type checking for WebRTC data
- Message length limits for chat

## 📈 Monitoring

### Logging

- Connection events (join/leave)
- WebRTC signaling events
- Error logging with stack traces
- Room creation/deletion events

### Health Monitoring

- Active connection count
- Room count and participant statistics
- Memory usage monitoring
- Graceful shutdown handling

## 🚀 Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Docker

```bash
docker build -t video-call-server .
docker run -p 3000:3000 video-call-server
```

### Environment-Specific Configuration

```bash
# Development
NODE_ENV=development npm run dev

# Production
NODE_ENV=production npm start
```

## 🔍 Troubleshooting

### Common Issues

1. **Port Already in Use**

   ```bash
   # Check what's using the port
   lsof -i :3000

   # Kill the process or change port
   PORT=3001 npm start
   ```

2. **Socket.IO Connection Issues**

   - Check CORS configuration
   - Verify transport settings
   - Check firewall settings

3. **WebRTC Signaling Problems**
   - Verify offer/answer format
   - Check ICE candidate structure
   - Monitor connection state logs

### Debug Mode

```bash
# Enable debug logging
DEBUG=socket.io* npm start
```

## 📝 Development

### Adding New Events

1. Add event handler in `server.js`
2. Include proper error handling
3. Add validation for incoming data
4. Update this documentation

### Testing

```bash
# Health check
npm run health

# Room info
npm run rooms
```

## 🔐 Security Considerations

### Production Deployment

- Configure CORS properly
- Use HTTPS in production
- Implement rate limiting
- Add authentication middleware
- Monitor for abuse

### Data Privacy

- Chat messages are stored in memory only
- No persistent storage of media streams
- Automatic cleanup of inactive sessions

## 📞 Support

For issues and questions:

1. Check the logs for error messages
2. Verify client-side WebRTC implementation
3. Test with different browsers
4. Check network connectivity

## 🔄 Updates

The server automatically handles:

- WebRTC connection state changes
- Participant reconnections
- Room cleanup
- Memory management

No manual intervention required for normal operation.
