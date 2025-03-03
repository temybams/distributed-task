import app from "./app";
import redisClient from "./config/redis.config";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Bull Board available at http://localhost:${PORT}/admin/queues`);


  try {
    if (redisClient.status === "end") { // Only reconnect if the connection is closed
      await redisClient.connect();
      console.log("Reconnected to Redis");
    } else if (redisClient.status === "connecting" || redisClient.status === "ready") {
      console.log("Redis is already connected");
    }
  } catch (error) {
    console.error("Redis Connection Failed:", error);
  }
});

// Gracefully handle shutdown
process.on("SIGINT", async () => {
  console.log("Closing Redis Connection...");
  await redisClient.quit();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});
