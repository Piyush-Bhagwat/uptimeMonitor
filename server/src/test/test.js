import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY
});

const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: "Explain what an HTTP 500 error means in one sentence. and use slang language only"
});

console.log(response.text);