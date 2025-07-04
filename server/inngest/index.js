import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDB from "../configs/db.js"; // ✅ Don't forget to import this!

// Create Inngest client
export const inngest = new Inngest({ id: "movie-Ticket-booking" });

// CREATE user function
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB(); // ✅ Always connect before DB ops

    const { id, first_name, last_name, email_address, image_url } = event.data;
    const userData = {
      _id: id,
      email: email_address[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.create(userData);
    console.log("✅ User created via Clerk webhook:", userData); // ✅ correct variable name
  }
);

// DELETE user function
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-from-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await connectDB(); // ✅ Always connect first
      console.log("📥 Received clerk/user.deleted:", event.data);

      const { id } = event.data;
      if (!id) throw new Error("Missing user ID in webhook payload");

      const result = await User.findByIdAndDelete(id);
      console.log("🗑️ Deleted user:", result);

      if (!result) {
        console.warn("⚠️ No user found with ID:", id);
      }
    } catch (error) {
      console.error("❌ Deletion Error:", error.message);
      throw error; // Re-throw to mark function as failed in Inngest
    }
  }
);

// UPDATE user function
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    await connectDB(); // ✅ required

    const { id, first_name, last_name, email_address, image_url } = event.data;
    const updatedData = {
      email: email_address[0].email_address,
      name: `${first_name} ${last_name}`,
      image: image_url,
    };

    await User.findByIdAndUpdate(id, updatedData);
    console.log("✏️ User updated via Clerk webhook:", updatedData);
  }
);

// Export all functions
export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];
