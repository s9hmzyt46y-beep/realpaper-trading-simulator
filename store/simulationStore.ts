import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SimulationState {
  simulationDate: Date | null;
  setSimulationDate: (date: Date | null) => void;
  isSimulationMode: boolean;
  autoRefresh: boolean;
  setAutoRefresh: (enabled: boolean) => void;
  refreshInterval: number;
  setRefreshInterval: (interval: number) => void;
  lastUpdated: Date | null;
  setLastUpdated: (date: Date) => void;
}

export const useSimulationStore = create<SimulationState>()(
  persist(
    (set) => ({
      simulationDate: null,
      setSimulationDate: (date) =>
        set({ simulationDate: date, isSimulationMode: date !== null }),
      isSimulationMode: false,
      autoRefresh: false,
      setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
      refreshInterval: 60,
      setRefreshInterval: (interval) => set({ refreshInterval: interval }),
      lastUpdated: null,
      setLastUpdated: (date) => set({ lastUpdated: date }),
    }),
    {
      name: "simulation-storage",
    }
  )
);

