import OpenAI from "openai";

export const meshClient = new OpenAI({
  baseURL: process.env.MESH_API_URL ?? "https://api.meshapi.ai/v1",
  apiKey: process.env.MESH_API_KEY ?? "",
});

export const SCREENING_MODEL = "google/gemini-2.0-flash-001";
