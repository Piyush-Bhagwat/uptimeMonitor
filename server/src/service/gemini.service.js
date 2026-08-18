import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_KEY
});

export const GeminiService = {
    getAnalyticsPrompt: (analyticsData, monitor) => {
        return `
        You are explaining uptime monitoring data to a developer.

        for url : ${monitor.url} (${monitor.name})

        Use ONLY the data provided below:

        ${JSON.stringify(analyticsData, null, 2)}

        Rules:
        - Do not invent any numbers, statistics, dates, durations, or facts.
        - Do not introduce numbers that are not present in the provided data.
        - Do not estimate or guess missing values.
        - Do not claim an event happened unless supported by the data.
        - You may explain relationships between the provided numbers, but do not create new statistics.
        - If something cannot be determined from the data, say so.

        Explain in plain language:
        - overall uptime
        - downtime
        - latency/performance
        - number of incidents
        - important HTTP errors
        - anything unusual

        Keep the explanation concise and useful for a developer.
        `
    },
    generate: async (prompt) => {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

        return response.text;
    }
};