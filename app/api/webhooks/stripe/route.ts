import { prisma } from "@/db/prisma";
import { updateOrderToPaid } from "@/lib/actions/order.actions";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  // Build webhooks
  const event = await Stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET as string
  );

  //check successful payment
  if (event.type === "charge.succeeded") {
    const session = event.data.object;

    //Update order status in your database
    await updateOrderToPaid({
      id: session.metadata.orderId,
      paymentResult: {
        id: session.id,
        status: "COMPLETED",
        email_address: session.billing_details.email!,
        pricePaid: (session.amount / 100).toFixed(2),
      },
    });
    return NextResponse.json({
      message: "OrderUpdateToPaid updated successfully",
    });
  }
  return NextResponse.json({
    message: "Event is not charge.succeeded",
  });
}
