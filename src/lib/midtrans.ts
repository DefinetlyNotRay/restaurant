import { Snap } from "midtrans-client";

const snap = new Snap({
  isProduction: false, // sandbox mode
  serverKey: process.env.MIDTRANS_SERVER_KEY!,
});

export interface MidtransOrderData {
  orderId: string;
  amount: number;
  customerDetails: {
    first_name: string;
    email: string;
    phone?: string;
  };
  itemDetails: Array<{
    id: string;
    price: number;
    quantity: number;
    name: string;
  }>;
}

// Convert USD to IDR (approximately 15,000 IDR = 1 USD)
const USD_TO_IDR = 15000;

export async function createMidtransPayment(orderData: MidtransOrderData) {
  try {
    // Convert all prices from USD to IDR and round to whole numbers (no cents allowed)
    const grossAmountIDR = Math.round(orderData.amount * USD_TO_IDR);

    const itemDetailsIDR = orderData.itemDetails.map((item) => ({
      id: item.id,
      price: Math.round(item.price * USD_TO_IDR), // Convert to IDR, no decimals
      quantity: item.quantity,
      name: item.name,
    }));

    const parameter = {
      transaction_details: {
        order_id: orderData.orderId,
        gross_amount: grossAmountIDR, // Must be integer for IDR
      },
      customer_details: orderData.customerDetails,
      item_details: itemDetailsIDR, // All prices must be integers for IDR
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/order-success?order_id=${orderData.orderId}`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/order-failed?order_id=${orderData.orderId}`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/order-pending?order_id=${orderData.orderId}`,
      },
    };

    console.log(
      "Midtrans payment parameter:",
      JSON.stringify(parameter, null, 2)
    );

    const transaction = await snap.createTransaction(parameter);
    return {
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    };
  } catch (error) {
    console.error("Midtrans payment creation failed:", error);
    throw new Error("Failed to create payment");
  }
}

export async function verifyMidtransSignature(
  orderId: string,
  statusCode: string,
  grossAmount: string,
  serverKey: string,
  signatureKey: string
): Promise<boolean> {
  const crypto = await import("crypto");
  const hash = crypto
    .createHash("sha512")
    .update(orderId + statusCode + grossAmount + serverKey)
    .digest("hex");

  return hash === signatureKey;
}
