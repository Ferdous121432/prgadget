import { auth } from "@/auth";
import { getOrderById } from "@/lib/actions/order.actions";
import { isOrderPaymentCollectible } from "@/lib/order-status";
import { convertPrismaObjectToJSObject } from "@/lib/utils";
import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Stripe from "stripe";
import OrderDetailsTable from "./order-details-table";

export const metadata: Metadata = {
  title: "Order Details",
};

// Force dynamic rendering since we use auth/session data
export const dynamic = "force-dynamic";

const OrderDetailsPage = async (props: {
  params: Promise<{
    id: string;
  }>;
}) => {
  const { id } = await props.params;

  const order = (await getOrderById(id)) as any;
  if (!order) notFound();

  const session = await auth();

  let client_secret: string | null = null;

  // Check if the order is paid via Stripe
  if (
    order.paymentMethod === "Stripe" &&
    isOrderPaymentCollectible(order.paymentStatus)
  ) {
    try {
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
      // create payment intent if not already created
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(order.totalPrice * 100), // convert to cents and round to avoid decimal issues
        currency: "usd",
        metadata: {
          orderId: order.id,
        },
      });
      client_secret = paymentIntent.client_secret;
      console.log("Created Stripe Payment Intent:", paymentIntent.id);
    } catch (error) {
      console.error("Error creating Stripe Payment Intent:", error);
    }
  }

  // Redirect the user if they don't own the order and are not an admin
  if (order.userId !== session?.user.id && session?.user.role !== "admin") {
    return redirect("/unauthorized");
  }

  return (
    <OrderDetailsTable
      order={convertPrismaObjectToJSObject(order)}
      paypalClientId={process.env.PAYPAL_CLIENT_ID || "sb"}
      stripeClientSecret={client_secret}
      isAdmin={session?.user?.role === "admin" || false}
    />
  );
};

export default OrderDetailsPage;
