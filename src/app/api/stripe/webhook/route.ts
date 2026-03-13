import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { subscriptions, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendSubscriptionEmail, sendAdminNotification, sendAbandonedCartEmail } from "@/lib/email";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("[stripe/webhook] signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const plan = session.metadata?.plan as
        | "monthly"
        | "annual"
        | "lifetime"
        | undefined;

      if (!userId || !plan) break;

      // Look up user email for notifications
      const [userRow] = await db.select({ email: users.email, name: users.name }).from(users).where(eq(users.id, userId)).limit(1);
      const userEmail = userRow?.email;

      if (plan === "lifetime") {
        await db.insert(subscriptions).values({
          userId,
          plan: "lifetime",
          status: "active",
          stripeSubscriptionId: session.payment_intent as string,
        });
        await db
          .update(users)
          .set({ role: "pro", updatedAt: new Date() })
          .where(eq(users.id, userId));
      } else if (session.subscription) {
        const sub = await getStripe().subscriptions.retrieve(
          session.subscription as string
        );
        const item = sub.items.data[0];
        await db.insert(subscriptions).values({
          userId,
          plan,
          status: "active",
          stripeSubscriptionId: sub.id,
          stripePriceId: item?.price.id,
          currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
          currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
        });
        await db
          .update(users)
          .set({ role: "pro", updatedAt: new Date() })
          .where(eq(users.id, userId));
      }

      // Send confirmation email to user
      if (userEmail) {
        sendSubscriptionEmail(userEmail, "activated", plan).catch((err) =>
          console.error("[Webhook] Subscription email failed:", err)
        );
      }

      // Notify admin
      const amount = session.amount_total ? `£${(session.amount_total / 100).toFixed(2)}` : "N/A";
      sendAdminNotification(
        `New ${plan} subscription! 🎉`,
        `<p><strong>User:</strong> ${userRow?.name || "Unknown"} (${userEmail || userId})</p>
         <p><strong>Plan:</strong> ${plan}</p>
         <p><strong>Amount:</strong> ${amount}</p>
         <p><strong>Time:</strong> ${new Date().toUTCString()}</p>`
      ).catch((err) => console.error("[Webhook] Admin notification failed:", err));

      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        .limit(1);

      if (existing[0]) {
        const status = sub.status === "active" ? "active" :
          sub.status === "past_due" ? "past_due" :
          sub.status === "canceled" ? "cancelled" : "incomplete";

        const item = sub.items.data[0];
        await db
          .update(subscriptions)
          .set({
            status,
            currentPeriodStart: item ? new Date(item.current_period_start * 1000) : null,
            currentPeriodEnd: item ? new Date(item.current_period_end * 1000) : null,
            cancelAtPeriodEnd: sub.cancel_at_period_end,
            updatedAt: new Date(),
          })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        if (status === "cancelled") {
          await db
            .update(users)
            .set({ role: "free", updatedAt: new Date() })
            .where(eq(users.id, existing[0].userId));

          // Notify user about cancellation
          const [userRow] = await db.select({ email: users.email }).from(users).where(eq(users.id, existing[0].userId)).limit(1);
          if (userRow?.email) {
            sendSubscriptionEmail(userRow.email, "cancelled", existing[0].plan).catch((err) =>
              console.error("[Webhook] Cancellation email failed:", err)
            );
          }

          sendAdminNotification(
            "Subscription cancelled ❌",
            `<p><strong>User:</strong> ${userRow?.email || existing[0].userId}</p>
             <p><strong>Plan:</strong> ${existing[0].plan}</p>
             <p><strong>Time:</strong> ${new Date().toUTCString()}</p>`
          ).catch((err) => console.error("[Webhook] Admin notification failed:", err));
        }
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const existing = await db
        .select()
        .from(subscriptions)
        .where(eq(subscriptions.stripeSubscriptionId, sub.id))
        .limit(1);

      if (existing[0]) {
        await db
          .update(subscriptions)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(eq(subscriptions.stripeSubscriptionId, sub.id));

        await db
          .update(users)
          .set({ role: "free", updatedAt: new Date() })
          .where(eq(users.id, existing[0].userId));

        const [userRow] = await db.select({ email: users.email }).from(users).where(eq(users.id, existing[0].userId)).limit(1);
        if (userRow?.email) {
          sendSubscriptionEmail(userRow.email, "cancelled", existing[0].plan).catch((err) =>
            console.error("[Webhook] Cancellation email failed:", err)
          );
        }

        sendAdminNotification(
          "Subscription deleted ❌",
          `<p><strong>User:</strong> ${userRow?.email || existing[0].userId}</p>
           <p><strong>Plan:</strong> ${existing[0].plan}</p>
           <p><strong>Time:</strong> ${new Date().toUTCString()}</p>`
        ).catch((err) => console.error("[Webhook] Admin notification failed:", err));
      }
      break;
    }

    case "checkout.session.expired": {
      const expiredSession = event.data.object as Stripe.Checkout.Session;
      const customerEmail =
        expiredSession.customer_details?.email ??
        expiredSession.customer_email;
      const customerName =
        expiredSession.customer_details?.name ?? undefined;

      if (customerEmail) {
        const locale = expiredSession.metadata?.locale ?? "en";
        sendAbandonedCartEmail(customerEmail, customerName, locale).catch(
          (err) =>
            console.error("[Webhook] Abandoned cart email failed:", err)
        );

        sendAdminNotification(
          "Abandoned checkout 🛒",
          `<p><strong>Email:</strong> ${customerEmail}</p>
           <p><strong>Name:</strong> ${customerName || "Unknown"}</p>
           <p><strong>Time:</strong> ${new Date().toUTCString()}</p>`
        ).catch((err) =>
          console.error("[Webhook] Admin notification failed:", err)
        );
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
