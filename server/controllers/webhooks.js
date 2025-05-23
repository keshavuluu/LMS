import { Webhook } from "svix";
import { User } from "../models/User.js";
import Stripe from "stripe";
import { Purchase } from "../models/Purchase.js";
import { Course } from "../models/Course.js";
const clearWebhooks = async (req, res) => {
  try {
    console.log("\n=== Webhook Request Received ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));

    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error("CLERK_WEBHOOK_SECRET is not set");
      console.log("Available environment variables:", Object.keys(process.env));
      return res.status(500).json({ error: "Webhook secret not configured" });
    }
    console.log("Webhook secret is configured");

    // Get the headers
    const svix_id = req.headers["svix-id"];
    const svix_timestamp = req.headers["svix-timestamp"];
    const svix_signature = req.headers["svix-signature"];

    if (!svix_id || !svix_timestamp || !svix_signature) {
      console.error("Missing required Svix headers");
      return res.status(400).json({ error: "Missing required headers" });
    }

    // Create Webhook instance
    const whook = new Webhook(webhookSecret);
    const body = JSON.stringify(req.body);

    try {
      await whook.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
      console.log("Webhook verification successful");
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return res.status(400).json({ error: "Invalid webhook signature" });
    }

    const { data, type } = req.body;
    console.log("Processing webhook type:", type);
    console.log("Webhook data:", JSON.stringify(data, null, 2));

    switch (type) {
      case "user.created": {
        console.log("=== Creating New User ===");
        try {
          const userData = {
            _id: data.id,
            email:
              data.email_addresses?.[0]?.email_address || "No email provided",
            name:
              `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
              "Anonymous",
            imageUrl: data.image_url || "",
          };
          console.log("User data to create:", userData);

          const existingUser = await User.findById(data.id);
          if (existingUser) {
            console.log("User already exists:", existingUser);
            return res.json({ success: true, user: existingUser });
          }

          const newUser = await User.create(userData);
          console.log("Successfully created new user:", newUser);
          return res.json({ success: true, user: newUser });
        } catch (createError) {
          console.error("Error creating user:", createError);
          return res.status(500).json({ error: createError.message });
        }
      }

      case "user.deleted": {
        console.log("=== Deleting User ===");
        try {
          console.log("User ID to delete:", data.id);
          const deletedUser = await User.findByIdAndDelete(data.id);
          console.log("Delete result:", deletedUser);
          return res.json({ success: true, deleted: !!deletedUser });
        } catch (deleteError) {
          console.error("Error deleting user:", deleteError);
          return res.status(500).json({ error: deleteError.message });
        }
      }

      case "user.updated": {
        console.log("=== Updating User ===");
        try {
          const userData = {
            email:
              data.email_addresses?.[0]?.email_address || "No email provided",
            name:
              `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
              "Anonymous",
            imageUrl: data.image_url || "",
          };
          console.log("User data to update:", userData);
          const updatedUser = await User.findByIdAndUpdate(data.id, userData, {
            new: true,
          });
          console.log("Successfully updated user:", updatedUser);
          return res.json({ success: true, user: updatedUser });
        } catch (updateError) {
          console.error("Error updating user:", updateError);
          return res.status(500).json({ error: updateError.message });
        }
      }

      default:
        console.log("Unhandled webhook type:", type);
        return res.status(400).json({ error: "Unhandled event type" });
    }
  } catch (error) {
    console.error("=== Webhook Error ===");
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    return res.status(500).json({ error: error.message });
  }
};
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const stripeWebhooks = async (request, response) => {
    const sig = request.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = Stripe.webhooks.constructEvent(request.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        response.status(200).json({ received: true });
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }
    switch (event.type) {
    case 'payment_intent.succeeded':{
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent:paymentIntentId
        })
        const {purchaseId} = session.data[0].metadata;
        const purchaseData = await Purchase.findById(purchaseId);
        const userData = await User.findById(purchaseData.userId)
        const courseData = await Course.findById(purchaseData.courseId.toString())

        courseData.enrolledStudents.push(userData);
        await courseData.save()
        userData.enrolledCourses.push(courseData._id)
await userData.save()
purchaseData.status-'completed'
await purchaseData.save()
        break;
        }
      case 'payment_intent.payment_failed':{
        const paymentIntent = event.data.object;
        const paymentIntentId = paymentIntent.id;
        const session = await stripeInstance.checkout.sessions.list({
          payment_intent:paymentIntentId
        })
        const {purchaseId} = session.data[0].metadata;
        const purchaseData = await Purchase.findById(purchaseId);
        purchaseData.status = 'failed'
        await purchaseData.save()

        break;
      }          
      default:
          console.log(`Unhandled event type ${event.type}`);
    }
  return response.status(200).json({ received: true });
};
