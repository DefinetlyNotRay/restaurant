import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { AIExtractionResult } from "@/types";

// Use OpenAI's GPT-4o-mini vision model - affordable and accurate
const visionModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "placeholder-key",
  model: "gpt-4o-mini", // Cheapest vision-capable model with excellent performance
  temperature: 0.1,
  maxTokens: 1024,
});

export async function extractProductInfo(
  imageUrl: string
): Promise<AIExtractionResult> {
  try {
    console.log("Extracting product info from image:", imageUrl);

    // Create a message with both text and image
    const message = new HumanMessage({
      content: [
        {
          type: "text",
          text: `You are an expert at analyzing food and beverage product images for restaurant menus. 

Look at this product image carefully and extract:
1. Product name (what you see in the image - be specific and accurate, read any text on packaging)
2. Short description (30-50 words describing what you see - ingredients, preparation style, appearance)
3. Estimated price in USD (reasonable restaurant pricing: appetizers $6-12, mains $12-25, drinks $3-8, desserts $6-10, packaged items $5-15)

IMPORTANT: 
- Base your response ONLY on what you actually see in the image
- If you see brand names or product names in the image, use those EXACTLY
- If you see packaging text, read it carefully and use it
- Be accurate and descriptive about the actual food item shown
- Don't make up information - describe what you actually see

Return ONLY a valid JSON object in this exact format with no additional text:
{"name": "Product Name", "description": "Brief description", "price": 12.99}`,
        },
        {
          type: "image_url",
          image_url: {
            url: imageUrl,
          },
        },
      ],
    });

    const response = await visionModel.invoke([message]);
    const content = response.content as string;

    console.log("AI Response:", content);

    // Clean up the response to ensure it's valid JSON
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const extracted = JSON.parse(jsonMatch[0]);

    // Validate the extracted data
    if (
      !extracted.name ||
      !extracted.description ||
      typeof extracted.price !== "number"
    ) {
      throw new Error("Invalid extraction result format");
    }

    return {
      name: extracted.name.trim(),
      description: extracted.description.trim(),
      price: Math.round(extracted.price * 100) / 100, // Round to 2 decimal places
    };
  } catch (error) {
    console.error("AI extraction failed:", error);

    // Fallback extraction with basic info
    return {
      name: "New Menu Item",
      description:
        "Please review and update the product details based on the image.",
      price: 9.99,
    };
  }
}

// Text-only model for description enhancement (using GPT-4o-mini for consistency)
const textModel = new ChatOpenAI({
  apiKey: process.env.OPENAI_API_KEY || "placeholder-key",
  model: "gpt-4o-mini",
  temperature: 0.3,
});

export async function enhanceProductDescription(
  name: string,
  currentDescription: string
): Promise<string> {
  try {
    const prompt = `Enhance this restaurant menu item description to be more appealing and detailed.

Current name: ${name}
Current description: ${currentDescription}

Create a better description that:
- Is appetizing and descriptive
- Mentions key ingredients or preparation
- Is 30-60 words long
- Sounds professional for a restaurant menu

Return only the enhanced description, no quotes or extra text.`;

    const response = await textModel.invoke(prompt);
    return (response.content as string).trim();
  } catch (error) {
    console.error("Description enhancement failed:", error);
    return currentDescription;
  }
}
