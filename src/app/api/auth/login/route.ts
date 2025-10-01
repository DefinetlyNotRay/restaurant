import { NextRequest } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyPassword, setSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // First, try to find user in admin_users table
    const { data: admin } = await supabaseAdmin
      .from("admin_users")
      .select("id, email, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (admin) {
      // Verify admin password
      const isValid = await verifyPassword(password, admin.password_hash);

      if (!isValid) {
        return Response.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }

      // Set session as admin
      await setSession({
        id: admin.id,
        email: admin.email,
        name: "Admin",
        role: "admin",
      });

      return Response.json({
        user: {
          id: admin.id,
          email: admin.email,
          name: "Admin",
          role: "admin",
        },
      });
    }

    // If not admin, try customers table
    const { data: customer } = await supabaseAdmin
      .from("customers")
      .select("id, email, name, password_hash")
      .eq("email", email.toLowerCase())
      .single();

    if (!customer) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify customer password
    const isValid = await verifyPassword(password, customer.password_hash);

    if (!isValid) {
      return Response.json(
        { error: "Invalid email or password" },
        { status: 401 }
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
    console.error("Login error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
