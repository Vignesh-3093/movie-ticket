// server.js
import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { clerkMiddleware } from "@clerk/express";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";
import User from "./models/User.js";
const app = express();
const port = 3000;

(async () => {
  try {
    await connectDB();

    // Middleware
    app.use(express.json());
    app.use(cors());
    app.use(clerkMiddleware());

    // API Routes
    app.get("/", (req, res) => res.send("server is Live!"));
    // app.use("/api/inngest", serve({ client: inngest, functions }));
    app.post("/users", async (req, res) => {
      try {
        const { name, email, password } = req.body;
        const id = crypto.randomUUID();
        const newUser = new User({ id, name, email, password });
        console.log(newUser);
        await newUser.save();

        res
          .status(201)
          .json({ message: "User created successfully", user: newUser });
      } catch (error) {
        console.error(error);
        res
          .status(400)
          .json({ message: "Error creating user", error: error.message });
      }
    });

    // Start Server
    app.listen(port, () =>
      console.log(`Server listening at http://localhost:${port}`)
    );
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
})();
