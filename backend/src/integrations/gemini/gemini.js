import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const gemini = new GoogleGenAI({
  apiKey: String(process.env.GEMINI_API_KEY),
});

export default gemini;
