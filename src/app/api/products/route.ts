import { NextRequest } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function GET() {
  try {
    const { data: products, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Database error:", error);
      return Response.json(
        { error: "Failed to fetch products" },
        { status: 500 }
      );
    }

    return Response.json(products || []);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, image_url } = body;

    // Validate required fields
    if (!name || !description || !price || !image_url) {
      return Response.json(
        {
          error: "Missing required fields: name, description, price, image_url",
        },
        { status: 400 }
      );
    }

    // Validate price is a positive number
    if (typeof price !== "number" || price <= 0) {
      return Response.json(
        { error: "Price must be a positive number" },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS for admin operations
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .insert([
        {
          name: name.trim(),
          description: description.trim(),
          price: Math.round(price * 100) / 100, // Round to 2 decimal places
          image_url,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return Response.json(
        { error: "Failed to create product" },
        { status: 500 }
      );
    }

    return Response.json(product, { status: 201 });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
