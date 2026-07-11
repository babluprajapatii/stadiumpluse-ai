import { api } from "@/lib/api";

export interface AIRecommendation {
  id: string;
  label: string;
  status: string;
  detail: string;
  priority: "critical" | "high" | "medium" | "low" | "ok";
  confidence: number;
  action: string;
  actionLabel: string;
}

export const AIService = {
  // Fetch GenAI operational recommendation updates
  async getRecommendations(): Promise<AIRecommendation[]> {
    try {
      return await api.get<AIRecommendation[]>("/ai/recommendations");
    } catch {
      // Return baseline mock recommendations
      return [
        {
          id: "crowd",
          label: "Crowd Risk",
          status: "High Congestion — Gate C",
          detail: "AI detected 18% crowd increase in 10 min. Gate C at 98% capacity.",
          priority: "high",
          confidence: 96,
          action: "Open Gate D immediately to redistribute flow.",
          actionLabel: "Open Gate D",
        },
        {
          id: "gate",
          label: "Gate Status",
          status: "Gate C Critical · Gate D Idle",
          detail: "3 of 8 gates operating below 40% capacity. Gate C over threshold.",
          priority: "medium",
          confidence: 99,
          action: "Redirect signage to Gates A, D, F.",
          actionLabel: "Update Signage",
        },
      ];
    }
  },

  // Dispatch GenAI recommended operation action
  async executeRecommendationAction(id: string): Promise<{ success: boolean; message: string }> {
    return api.post<{ success: boolean; message: string }>(`/ai/recommendations/${id}/execute`);
  },

  // Stream operational update inquiries
  async queryPulseAI(prompt: string): Promise<string> {
    try {
      const response = await api.post<{ reply: string }>("/ai/chat", { prompt });
      return response.reply;
    } catch {
      return "Pulse AI is currently offline. Simulating response: Operations are within normal parameters.";
    }
  },
};
