import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { hashPassword, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate input
    if (!email || !password || !name) {
      return Response.json(
        { error: "Email, password, and name are required" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return Response.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    // Check if email already exists in customers table
    const { data: existingCustomer } = await supabaseAdmin
      .from("customers")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingCustomer) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Check if email exists in admin_users table
    const { data: existingAdmin } = await supabaseAdmin
      .from("admin_users")
      .select("id")
      .eq("email", email.toLowerCase())
      .single();

    if (existingAdmin) {
      return Response.json(
        { error: "Email already registered" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create customer
    const { data: customer, error } = await supabaseAdmin
      .from("customers")
      .insert([
        {
          email: email.toLowerCase(),
          password_hash: passwordHash,
          name,
        },
      ])
      .select("id, email, name")
      .single();

    if (error) {
      console.error("Customer creation error:", error);
      return Response.json(
        { error: "Failed to create account" },
        { status: 500 }
      );
    }

    // Set session as customer
    await setSession({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      role: "customer",
    });

    return Response.json({
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
