import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyMidtransSignature } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      order_id,
      status_code,
      gross_amount,
      signature_key,
      transaction_status,
      fraud_status,
    } = body;

    // Verify signature
    const isValidSignature = await verifyMidtransSignature(
      order_id,
      status_code,
      gross_amount,
      process.env.MIDTRANS_SERVER_KEY!,
      signature_key
    );

    if (!isValidSignature) {
      console.error("Invalid Midtrans signature");
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    // Determine order status based on transaction status
    let orderStatus = "pending";

    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      if (fraud_status === "accept" || !fraud_status) {
        orderStatus = "paid";
      }
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "expire"
    ) {
      orderStatus = "cancelled";
    } else if (transaction_status === "pending") {
      orderStatus = "pending";
    }

    // Update order status in database
    const { error } = await supabase
      .from("orders")
      .update({
        status: orderStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", order_id);

    if (error) {
      console.error("Failed to update order status:", error);
      return Response.json(
        { error: "Failed to update order" },
        { status: 500 }
      );
    }

    // Trigger n8n workflow if configured
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(process.env.N8N_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "payment_update",
            order_id,
            status: orderStatus,
            transaction_status,
            timestamp: new Date().toISOString(),
          }),
        });
      } catch (n8nError) {
        console.error("Failed to trigger n8n workflow:", n8nError);
        // Don't fail the webhook if n8n is down
      }
    }

    console.log(`Order ${order_id} status updated to: ${orderStatus}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}



