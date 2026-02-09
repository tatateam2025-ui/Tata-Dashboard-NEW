
import { GoogleGenAI } from "@google/genai";
import { Lead, ManpowerStats } from "../types";

export class AIService {
  private static ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

  static async generateExecutiveInsights(leads: Lead[], manpower: ManpowerStats): Promise<string> {
    const prompt = `
      You are an expert business consultant. Analyze the following dashboard data for Navigant Tech and provide a high-level executive summary.
      
      Data Summary:
      - Total Leads in View: ${leads.length}
      - Total MRC Value: $${leads.reduce((sum, l) => sum + l.mrcValue, 0).toLocaleString()}
      - Lead Status Breakdown: ${JSON.stringify(this.getBreakdown(leads, 'status'))}
      - Lead Category Breakdown: ${JSON.stringify(this.getBreakdown(leads, 'category'))}
      - Manpower: ${manpower.present} present out of ${manpower.total} total staff (${Math.round(manpower.present/manpower.total*100)}% utilization).
      
      Please provide:
      1. A brief "Pulse Check" on the current situation.
      2. Top 3 Strategic Recommendations (Actionable).
      3. One potential risk factor to monitor.
      
      Keep the tone professional, concise, and executive-ready. Format the output with clear headings and bullet points.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      return response.text || "Unable to generate insights at this time.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "An error occurred while communicating with the AI. Please ensure your API key is configured correctly.";
    }
  }

  private static getBreakdown(leads: Lead[], key: keyof Lead) {
    return leads.reduce((acc: any, lead) => {
      const val = lead[key] as string;
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
  }
}
