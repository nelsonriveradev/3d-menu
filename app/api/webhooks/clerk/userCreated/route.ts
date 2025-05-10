import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb/dbConnect";

// Ensure MongoDB URI and Webhook Secret are in environment variables
const mongoClient = clientPromise;
const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET!;

async function connectToDatabase() {
  try {
    (await mongoClient).connect();
    console.log("Successfully connected to MongoDB Atlas!");
    return (await mongoClient).db("bettermenu-db"); // Replace with your DB name
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    // Close connection if open on error
    (await mongoClient).close();
    throw error; // Re-throw error to be caught by the handler
  }
}

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occurred -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const webhook = new Webhook(WEBHOOK_SECRET);

  let webhookEvent: WebhookEvent;

  // Verify the payload with the headers
  try {
    webhookEvent = webhook.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occurred -- verification failed", {
      status: 400,
    });
  }

  // Get the ID and type
  const { id } = webhookEvent.data;
  const eventType = webhookEvent.type;

  console.log(
    `Received webhook event: ID=${id}, Type=${eventType}, Body=${body}`
  );

  console.log(`Webhook with an ID of ${id} and type of ${eventType}`);

  // Handle the user.created event
  if (eventType === "user.created") {
    const {
      id: clerkUserId,
      email_addresses,
      first_name,
      last_name,
      image_url,
      created_at,
      updated_at,
    } = webhookEvent.data;

    // Prepare user data for MongoDB
    const userDocument = {
      clerkId: clerkUserId, // Use clerkId to avoid conflict with MongoDB's _id
      email: email_addresses[0]?.email_address, // Get the primary email
      firstName: first_name,
      lastName: last_name,
      imageUrl: image_url,
      clerkCreatedAt: new Date(created_at),
      clerkUpdatedAt: new Date(updated_at),
      // Add any other fields you want to store
      appCreatedAt: new Date(), // Timestamp for when it was added to your DB
    };

    let db;
    try {
      db = await connectToDatabase();
      const usersCollection = db.collection("users"); // Replace with your collection name

      // Insert the new user document
      // Using updateOne with upsert:true is safer if webhooks might retry
      const result = await usersCollection.updateOne(
        { clerkId: userDocument.clerkId }, // Filter by Clerk ID
        { $set: userDocument }, // Set the user data
        { upsert: true } // Insert if not found, update if found
      );

      console.log(`MongoDB operation result for user ${clerkUserId}:`, result);

      if (result.upsertedCount > 0) {
        console.log(`Successfully inserted user ${clerkUserId} into MongoDB.`);
      } else if (result.matchedCount > 0 && result.modifiedCount > 0) {
        console.log(`Successfully updated user ${clerkUserId} in MongoDB.`);
      } else if (result.matchedCount > 0 && result.modifiedCount === 0) {
        console.log(`User ${clerkUserId} already exists with the same data.`);
      } else {
        console.warn(`User ${clerkUserId} was not inserted or updated.`);
      }
    } catch (error) {
      console.error("Error processing user.created webhook:", error);
      return NextResponse.json(
        { success: false, error: "Internal Server Error" },
        { status: 500 }
      );
    } finally {
      // Ensures that the client will close when you finish/error
      // Avoid closing the client here if you plan to reuse the connection across multiple requests
      // await mongoClient.close();
      // console.log("MongoDB connection closed.");
      // If you keep the connection open, manage it appropriately (e.g., in serverless environments, it might stay warm).
    }
  } else {
    console.log(`Received unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
