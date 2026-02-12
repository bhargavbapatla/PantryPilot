import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini only once
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const generateBakingAdvice = async (
  userQuery,
  inventory,
  lowStock,
  recentOrders
) => {
  try {
    // Construct the System Prompt (The "Brain")
    const prompt = `
      You are PantryPilot AI, a smart assistant for a home baking business.
      
      CONTEXT - CURRENT BUSINESS STATUS:
      - Low Stock Alerts: ${JSON.stringify(lowStock)}
      - Full Inventory: ${JSON.stringify(inventory)}
      - Recent 5 Orders: ${JSON.stringify(recentOrders)}
      
      USER QUESTION: "${userQuery}"
      
      INSTRUCTIONS:
      1. Analyze the inventory to see if the user's request is possible.
      2. If suggesting a recipe, verify we have the ingredients in the 'Full Inventory' list.
      3. Be concise, helpful, and polite. 
      4. If stock is low on a critical ingredient for the query, warn the user.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
    
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("I couldn't reach the AI brain right now.");
  }
};