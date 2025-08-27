import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppFilters } from "@/types";

interface FilterState {
  filters: AppFilters;
  setFilters: (filters: Partial<AppFilters>) => void;
  resetFilters: () => void;
}

const defaultFilters: AppFilters = {
  search: "",
  status: [],
  category: [],
  sortBy: "submittedAt",
  sortOrder: "desc",
};

// Persist filter settings to localStorage for UX
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      filters: defaultFilters,
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),
      resetFilters: () => set({ filters: defaultFilters }),
    }),
    {
      name: "app-filters",
      partialize: (state) => ({ filters: state.filters }),
    },
  ),
);
