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

console.log("=== Config.js Debug ===");
console.log("Hostname:", window.location.hostname);
console.log("Environment:", env);
console.log("Config:", config);
console.log("Selected socketUrl:", config[env].socketUrl);

window.SOCKET_URL = config[env].socketUrl;
console.log("SOCKET_URL set to:", window.SOCKET_URL);
