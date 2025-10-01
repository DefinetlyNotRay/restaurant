import { NextRequest } from "next/server";
import { extractProductInfo } from "@/lib/langchain";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl } = body;

    console.log("AI Extract API called with imageUrl:", imageUrl);

    if (!imageUrl) {
      return Response.json({ error: "Image URL is required" }, { status: 400 });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return Response.json(
        { error: "Invalid image URL format" },
        { status: 400 }
      );
    }

    console.log("Starting AI extraction...");
    const extractedInfo = await extractProductInfo(imageUrl);
    console.log("AI extraction completed:", extractedInfo);

    return Response.json(extractedInfo);
  } catch (error) {
    console.error("AI extraction error:", error);
    return Response.json(
      {
        error: "Failed to extract product information",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
