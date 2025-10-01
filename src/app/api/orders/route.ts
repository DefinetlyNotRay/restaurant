import { NextRequest } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";
import { createMidtransPayment } from "@/lib/midtrans";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      customer_name,
      customer_email,
      customer_phone,
      items,
      total_amount,
    } = body;

    console.log("Creating order for:", customer_name, customer_email);

    // Validate required fields
    if (!customer_name || !customer_email || !items || !total_amount) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json(
        { error: "Items array is required and cannot be empty" },
        { status: 400 }
      );
    }

    // Create order in database using admin client to bypass RLS
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert([
        {
          customer_name,
          customer_email,
          customer_phone,
          total_amount,
          status: "pending",
        },
      ])
      .select()
      .single();

    if (orderError) {
      console.error("Order creation error:", orderError);
      return Response.json(
        { error: "Failed to create order" },
        { status: 500 }
      );
    }

    console.log("Order created:", order.id);

    // Create order items using admin client
    const orderItems = items.map(
      (item: { product_id: string; quantity: number; price: number }) => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })
    );

    const { error: itemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItems);

    if (itemsError) {
      console.error("Order items creation error:", itemsError);
      // Rollback order creation
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      return Response.json(
        { error: "Failed to create order items" },
        { status: 500 }
      );
    }

    console.log("Order items created");

    // Create payment with Midtrans Snap
    try {
      console.log("Creating Midtrans payment...");
      const paymentData = {
        orderId: order.id,
        amount: total_amount,
        customerDetails: {
          first_name: customer_name,
          email: customer_email,
          phone: customer_phone,
        },
        itemDetails: items.map(
          (item: {
            product_id: string;
            quantity: number;
            price: number;
            name?: string;
          }) => ({
            id: item.product_id,
            price: item.price,
            quantity: item.quantity,
            name: item.name || "Product",
          })
        ),
      };

      const payment = await createMidtransPayment(paymentData);
      console.log("Midtrans payment created:", payment.token);

      // Update order with payment token using admin client
      await supabaseAdmin
        .from("orders")
        .update({ payment_id: payment.token })
        .eq("id", order.id);

      return Response.json({
        order,
        payment,
      });
    } catch (paymentError) {
      console.error("Payment creation error:", paymentError);
      return Response.json(
        {
          error: "Order created but payment setup failed",
          details:
            paymentError instanceof Error
              ? paymentError.message
              : "Unknown error",
          order,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    let query = supabase
      .from("orders")
      .select(
        `
        *,
        order_items (
          *,
          products (*)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (email) {
      query = query.eq("customer_email", email);
    }

    const { data: orders, error } = await query;

    if (error) {
      console.error("Database error:", error);
      return Response.json(
        { error: "Failed to fetch orders" },
        { status: 500 }
      );
    }

    return Response.json(orders || []);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
