import { render } from "@react-email/render";
import dotenv from "dotenv";
import { Resend } from "resend";
dotenv.config();

import PurchaseReceiptEmail from "./purchase-receipt";

const resend = new Resend(process.env.RESEND_API_KEY as string);

export const sendPurchaseReceipt = async ({ order }: { order: any }) => {
  try {
    const emailHtml = await render(<PurchaseReceiptEmail order={order} />);
    //TODO: replace reciever & sender email after adding private domain
    const result = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>",
      to: ["firdousazam@iut-dhaka.edu"],
      subject: `Order Confirmation ${order.id}`,
      html: emailHtml,
    });

    console.log("Email sent successfully:", result);
    return result;
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
};
