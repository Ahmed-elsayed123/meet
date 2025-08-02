const config = {
  development: {
    socketUrl: 'http://localhost:3000'
  },
  production: {
    socketUrl: 'https://your-app-name.onrender.com' // Replace with your actual Render URL
  }
};

const env = window.location.hostname === 'localhost' ? 'development' : 'production';
window.SOCKET_URL = config[env].socketUrl; 