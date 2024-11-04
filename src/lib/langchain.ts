import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export const llm = new ChatGoogleGenerativeAI({
  model: "gemini-1.5-pro",
  temperature: 0,
  maxRetries: 2,
  apiKey: "AIzaSyCzeSqjiNebUVOIIWpFH-L5pRjEwcY1BsU",
});