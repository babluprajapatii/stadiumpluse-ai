import { api } from "@/lib/api";

export interface GateStatus {
  name: string;
  value: number;
  color: string;
  open: boolean;
  warn?: boolean;
}

export interface StadiumMetrics {
  activeFans: number;
  capacityRate: number;
  systemStatus: "ok" | "warning" | "critical";
  activeIncidents: number;
}

export interface FoodItem {
  id: string;
  name: string;
  price: number;
  description: string;
  estimatedMinutes: number;
  category: string;
  available: boolean;
  image: string;
}

export const StadiumService = {
  // Fetch overall stadium operating metrics
  async getMetrics(): Promise<StadiumMetrics> {
    try {
      return await api.get<StadiumMetrics>("/stadium/metrics");
    } catch {
      // Fallback fallback metrics
      return {
        activeFans: 47300,
        capacityRate: 78.8,
        systemStatus: "ok",
        activeIncidents: 0,
      };
    }
  },

  // Fetch gate capacity and operating states
  async getGates(): Promise<GateStatus[]> {
    try {
      return await api.get<GateStatus[]>("/stadium/gates");
    } catch {
      return [
        { name: "A", value: 62, color: "var(--color-success)", open: true },
        { name: "B", value: 91, color: "var(--color-warning)", open: true },
        { name: "C", value: 98, color: "var(--color-error)", open: true, warn: true },
        { name: "D", value: 34, color: "var(--color-success)", open: false },
      ];
    }
  },

  // Update gate status parameters
  async updateGate(name: string, payload: Partial<GateStatus>): Promise<GateStatus> {
    return api.post<GateStatus>(`/stadium/gates/${name}`, payload);
  },

  // Fetch food court menu items
  async getFoodMenu(): Promise<FoodItem[]> {
    try {
      return await api.get<FoodItem[]>("/food/menu");
    } catch {
      return [
        {
          id: "m1",
          name: "Championship Burger Combo",
          price: 18.5,
          description: "Prime beef, cheddar, Stadium sauce, fries & 24oz drink.",
          estimatedMinutes: 8,
          category: "combo",
          available: true,
          image: "/burger.png",
        },
        {
          id: "m2",
          name: "Gridiron Pizza Slice",
          price: 9.0,
          description: "Jumbo pepperoni slice with double mozzarella.",
          estimatedMinutes: 3,
          category: "pizza",
          available: true,
          image: "/pizza.png",
        },
      ];
    }
  },

  // Submit new food concession order
  async placeConcessionOrder(items: { id: string; quantity: number }[]): Promise<{ orderId: string; status: string }> {
    return api.post<{ orderId: string; status: string }>("/food/orders", { items });
  },
};
