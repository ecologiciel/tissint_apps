import type { NormalizedScanResult, ScanScenarioKey } from "./domain";
import { evaluateScanDecision } from "./verdict";

const MOCKS: Record<ScanScenarioKey, { score: number; rare: boolean; className: string }> = {
  A: {
    score: 0.32,
    rare: false,
    className: "Roche terrestre (Quartz/Basalte)",
  },
  B: {
    score: 0.72,
    rare: false,
    className: "Presomption Chondrite L6",
  },
  C: {
    score: 0.88,
    rare: false,
    className: "Chondrite H5 - Validee",
  },
  D: {
    score: 0.94,
    rare: true,
    className: "Meteorite Martienne (Shergottite)",
  },
};

export function buildMockScanResult(
  scenario: ScanScenarioKey,
  scanId = `mock-${scenario.toLowerCase()}-scan`,
): NormalizedScanResult {
  const mock = MOCKS[scenario];
  const decision = evaluateScanDecision({
    fusionScore: mock.score,
    className: mock.className,
    isRare: mock.rare,
  });

  return {
    ...decision,
    scanId,
    modelScores: {
      edino: Math.max(0, mock.score - 0.03),
      convnext: Math.max(0, mock.score - 0.06),
      swin: Math.min(1, mock.score + 0.03),
      fusion: mock.score,
    },
    classConfidence: mock.score,
    createdAt: new Date().toISOString(),
  };
}

export function nextMockScenario(scenario: ScanScenarioKey): ScanScenarioKey {
  const order: ScanScenarioKey[] = ["A", "B", "C", "D"];
  return order[(order.indexOf(scenario) + 1) % order.length];
}
