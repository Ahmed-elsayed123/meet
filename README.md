# Video Call Application

A modern video calling application built with WebRTC, Socket.IO, and Firebase authentication. Features real-time video/audio communication, screen sharing, chat functionality, and meeting management.

## Features

- 🔐 **Firebase Authentication** - Secure login/signup with email and Google OAuth
- 📹 **Real-time Video Calls** - WebRTC peer-to-peer video and audio communication
- 🖥️ **Screen Sharing** - Share your screen with meeting participants
- 💬 **Live Chat** - Real-time messaging during meetings
- 📅 **Meeting Management** - Schedule, join, and manage meetings
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🔄 **Persistent Storage** - Meetings stored locally using localStorage

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend**: Node.js, Express.js
- **Real-time Communication**: Socket.IO
- **WebRTC**: Peer-to-peer video/audio streaming
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore (for user profiles)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase project with authentication enabled

## Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd video-call-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure Firebase**

   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Get your Firebase configuration
   - Update the Firebase config in `public/login.html` and `public/dashboard.html`

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## Firebase Configuration

Update the Firebase configuration in the following files:

### `public/login.html`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

### `public/dashboard.html`

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id",
};
```

## Usage

### Authentication

1. Visit the application homepage
2. Sign up with email/password or use Google OAuth
3. You'll be redirected to the dashboard after successful authentication

### Dashboard

- View your profile information
- Schedule new meetings
- See upcoming and past meetings
- Join existing meetings

### Meeting Room

- **Video Controls**: Mute/unmute audio, turn video on/off
- **Screen Sharing**: Share your screen with participants
- **Chat**: Send messages to meeting participants
- **Participant Management**: See who's in the meeting

## Project Structure

```
video-call-app/
├── public/
│   ├── login.html          # Authentication page
│   ├── dashboard.html      # Main dashboard
│   └── meeting-room.html   # Video call interface
├── server.js              # Express server with Socket.IO
├── package.json           # Dependencies and scripts
└── README.md             # This file
```

## API Endpoints

- `GET /` - Login page
- `GET /dashboard` - Dashboard page
- `GET /meeting-room` - Meeting room page

## Socket.IO Events

### Client to Server

- `join-room` - Join a meeting room
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - ICE candidate
- `chat-message` - Send chat message
- `screen-share-start` - Start screen sharing
- `screen-share-stop` - Stop screen sharing

### Server to Client

- `user-joined` - New user joined
- `user-left` - User left the room
- `room-participants` - Current participants
- `offer` - WebRTC offer from peer
- `answer` - WebRTC answer from peer
- `ice-candidate` - ICE candidate from peer
- `chat-message` - New chat message
- `chat-history` - Chat history
- `screen-share-start` - Peer started screen sharing
- `screen-share-stop` - Peer stopped screen sharing

## WebRTC Configuration

The application uses Google's public STUN servers for NAT traversal:

```javascript
const configuration = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};
```

## Deployment

### Local Development

```bash
npm run dev
```

### Production

```bash
npm start
```

### Environment Variables

- `PORT` - Server port (default: 3000)

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Security Considerations

- HTTPS is required for WebRTC in production
- Firebase security rules should be configured
- Input validation and sanitization implemented
- CORS configured for Socket.IO

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include browser console logs and error messages

## Roadmap

- [ ] Recording functionality
- [ ] Virtual backgrounds
- [ ] Meeting recording
- [ ] Advanced chat features
- [ ] Meeting analytics
- [ ] Mobile app
- [ ] Integration with calendar services
