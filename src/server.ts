import app from "./app";
import redisClient from "./config/redis.config";

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Bull Board available at http://localhost:${PORT}/admin/queues`);


  try {
    if (redisClient.status === "end") { 
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
const gracefulShutdown = async () => {
  console.log("⚠️ Closing Redis Connection...");
  await redisClient.quit();
  server.close(() => {
    console.log(" Server closed.");
    process.exit(0);
  });
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);