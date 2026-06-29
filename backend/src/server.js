require("dotenv").config();
const app = require("./app");
const { connectDb } = require("./config/db");

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDb();
    app.listen(PORT, () => {
      console.log(`D-Ranky backend is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
