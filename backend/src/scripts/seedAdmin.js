require("dotenv").config();
const bcrypt = require("bcryptjs");
const { connectDb } = require("../config/db");
const User = require("../models/User");

async function seedAdmin() {
  try {
    await connectDb();

    const fullName = process.env.ADMIN_NAME || "D-Ranky Admin";
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;

    if (!email || !password) {
      throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      existing.role = "admin";
      await existing.save();
      console.log("Existing user promoted to admin.");
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await User.create({ fullName, email, passwordHash, role: "admin" });
    console.log("Admin user created successfully.");
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
}

seedAdmin();
