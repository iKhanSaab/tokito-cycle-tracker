import { describe, it, expect, beforeEach } from "vitest";
import { useStore } from "./useStore";

describe("Tokito store", () => {
  beforeEach(() => {
    useStore.getState().clearAllData();
  });

  it("adds and retrieves a log", () => {
    const { addLog, getLog } = useStore.getState();

    const log = {
      date: "2026-01-01",
      snapshotType: "morning",
      moodQuick: 50,
      energyQuick: 60,
      sleepHours: 7,
      phase: "follicular",
      timestamp: new Date().toISOString(),
    };

    addLog(log);

    const stored = getLog("2026-01-01", "morning");
    expect(stored).toBeDefined();
    expect(stored.moodQuick).toBe(50);
  });
});
