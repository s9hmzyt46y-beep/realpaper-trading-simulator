import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AutoRefreshState {
  isEnabled: boolean;
  interval: number; // in seconds
  lastUpdated: Date | null;
  setEnabled: (enabled: boolean) => void;
  setInterval: (interval: number) => void;
  updateLastRefresh: () => void;
}

export const useAutoRefresh = create<AutoRefreshState>()(
  persist(
    (set) => ({
      isEnabled: true,
      interval: 30,
      lastUpdated: null,
      setEnabled: (enabled) => set({ isEnabled: enabled }),
      setInterval: (interval) => set({ interval }),
      updateLastRefresh: () => set({ lastUpdated: new Date() }),
    }),
    {
      name: "auto-refresh-storage",
    }
  )
);

