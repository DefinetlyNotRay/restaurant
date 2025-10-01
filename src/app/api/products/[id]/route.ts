import { NextRequest } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Delete the product (use admin client to bypass RLS)
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Database error:", error);

      // Check if it's a foreign key constraint error
      if (error.code === "23503") {
        return Response.json(
          {
            error:
              "Cannot delete product - it's referenced in existing orders. Please run the fix_product_deletion.sql script to allow deletion.",
          },
          { status: 400 }
        );
      }

      return Response.json(
        { error: "Failed to delete product" },
        { status: 500 }
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Database error:", error);
      return Response.json({ error: "Product not found" }, { status: 404 });
    }

    return Response.json(product);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, price, image_url } = body;

    if (!id) {
      return Response.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!name || !description || !price) {
      return Response.json(
        { error: "Missing required fields: name, description, price" },
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

    const updateData: {
      name: string;
      description: string;
      price: number;
      updated_at: string;
      image_url?: string;
    } = {
      name: name.trim(),
      description: description.trim(),
      price: Math.round(price * 100) / 100,
      updated_at: new Date().toISOString(),
    };

    if (image_url) {
      updateData.image_url = image_url;
    }

    // Use admin client to bypass RLS for admin operations
    const { data: product, error } = await supabaseAdmin
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      return Response.json(
        { error: "Failed to update product" },
        { status: 500 }
      );
    }

    return Response.json(product);
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
