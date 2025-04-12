import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { Webhook } from "svix";
import type { WebhookEvent } from "@clerk/nextjs/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

// ENV VARIBLES
const CLERK_WEBHOOK_SIGNING_SECRET = process.env.CLERK_WEBHOOK_SIGNING_SECRET;
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (
  !CLERK_WEBHOOK_SIGNING_SECRET ||
  !STRIPE_SECRET_KEY ||
  !SUPABASE_URL ||
  !SUPABASE_SERVICE_ROLE_KEY
) {
  console.error("Missing required environment variables!");
}

// Initial for stripe
const stripe = new Stripe(STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

// initial supabase admin

const supabaseAdmin = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false },
});

// user created webhook

export async function POST(request: Request) {
  if (!CLERK_WEBHOOK_SIGNING_SECRET) {
    console.error("Clerk signing secret is not configured");
    return NextResponse.json(
      { error: "Webhook secret not configured." },
      { status: 500 }
    );
  }

  const headerPayload = headers();
  const svix_id = (await headerPayload).get("svix-id");
  const svix_timestamp = (await headerPayload).get("svix-timestamp");
  const svix_signature = (await headerPayload).get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.warn("Missing svix headers");
    return NextResponse.json(
      { error: "Missing required webhook headers" },
      { status: 400 }
    );
  }

  const payload = await request.text();

  const webhookVerifier = new Webhook(CLERK_WEBHOOK_SIGNING_SECRET);

  let webhookEvent: WebhookEvent;

  try {
    webhookEvent = webhookVerifier.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;

    console.log("Webhook verified succesfully. Event Type:", webhookEvent.type);
  } catch (error: any) {
    console.error("Error verifying webhook:", error.message);
    return NextResponse.json(
      { error: `Webhook verification failed: ${error.message}` },
      { status: 400 }
    );
  }

  //   user.created event handle
  const eventType = webhookEvent.type;
  if (eventType === "user.created") {
    console.log("Processing user.created event...");

    const { id: userId, email_addresses } = webhookEvent.data;

    if (!userId) {
      console.error("Missing user ID in webhook payload");
      return NextResponse.json({ error: "Mssing user Id" }, { status: 400 });
    }

    const primaryEmail = email_addresses?.find(
      (email) => email.id === webhookEvent.data.primary_email_address_id
    )?.email_address;

    if (!primaryEmail) {
      console.warn(`User ${userId} created without a primary email address`);
    }

    try {
      console.log(`Creating Stripe customer for user ${userId}...`);
      const stripeCustomer = await stripe.customers.create({
        email: primaryEmail,
        name: `${webhookEvent.data.first_name ?? ""} ${
          webhookEvent.data.last_name
        }`.trim(),
        metadata: {
          clerk_user_id: userId,
        },
      });
      console.log(
        `Stripe customer created: ${stripeCustomer.id} for user ${userId}`
      );

      // Insert Data into Supabase
      console.log(`Upserting user ${userId} int Supabase...`);
      const { data: upsertedUser, error: supabaseError } = await supabaseAdmin
        .from("users")
        .upsert(
          {
            clerk_id: userId,
            email: primaryEmail,
            stripe_customer_id: stripeCustomer.id,
          },
          { onConflict: "id" }
        )
        .select()
        .single();
      if (supabaseError) {
        console.error("Supabase upsert error:", supabaseError);
        return NextResponse.json(
          { error: `Supabase error: ${supabaseError.message}` },
          {
            status: 500,
          }
        );
      }
      console.log(
        `Successfully upserted user ${userId} with Stripe ID ${stripeCustomer.id} into supabase.`,
        upsertedUser
      );
    } catch (error: any) {
      console.error(
        `Error processing user.created for ${userId}:`,
        error.message
      );
      return NextResponse.json(
        { error: `Internal server error: ${error.message}` },
        { status: 500 }
      );
    }
  } else {
    console.log(`Received unhandled event type: ${eventType}`);
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
