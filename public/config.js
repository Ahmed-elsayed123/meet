const config = {
  development: {
    socketUrl: "http://localhost:3000",
  },
  production: {
    socketUrl: "https://meet-5tup.onrender.com",
  },
};

const env =
  window.location.hostname === "localhost" ? "development" : "production";
window.SOCKET_URL = config[env].socketUrl;
