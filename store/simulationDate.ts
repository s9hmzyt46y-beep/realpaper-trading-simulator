import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SimulationDateState {
  simulationDate: Date | string | null;
  isSimulationMode: boolean;
  setSimulationDate: (date: Date | null) => void;
  resetToNow: () => void;
  getDate: () => Date | null;
}

export const useSimulationDate = create<SimulationDateState>()(
  persist(
    (set, get) => ({
      simulationDate: null,
      isSimulationMode: false,
      setSimulationDate: (date) =>
        set({
          simulationDate: date,
          isSimulationMode: date !== null,
        }),
      resetToNow: () =>
        set({
          simulationDate: null,
          isSimulationMode: false,
        }),
      getDate: () => {
        const { simulationDate } = get();
        if (!simulationDate) return null;
        return simulationDate instanceof Date ? simulationDate : new Date(simulationDate);
      },
    }),
    {
      name: "simulation-date-storage",
    }
  )
);

