import { create } from "zustand";
import type { NormalizedScanResult, ScanScenarioKey } from "@tissint/shared";
import { nextMockScenario } from "@tissint/shared";

interface ScanState {
  lastResult: NormalizedScanResult | null;
  mockScenario: ScanScenarioKey;
  setLastResult: (result: NormalizedScanResult | null) => void;
  cycleMockScenario: () => void;
}

export const useScanStore = create<ScanState>((set) => ({
  lastResult: null,
  mockScenario: "C",
  setLastResult: (lastResult) => set({ lastResult }),
  cycleMockScenario: () => set((state) => ({ mockScenario: nextMockScenario(state.mockScenario) })),
}));
