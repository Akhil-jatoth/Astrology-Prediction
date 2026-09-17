'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CalculatedChart } from '@/lib/astro-engine';
import type { InterpretationResult } from '@/lib/ai/AstrologyInterpreter';

interface ChartState {
  lastChart: CalculatedChart | null;
  lastInterpretation: InterpretationResult | null;
  setChart: (chart: CalculatedChart, interpretation: InterpretationResult) => void;
  clearChart: () => void;
}

export const useChartStore = create<ChartState>()(
  persist(
    (set) => ({
      lastChart: null,
      lastInterpretation: null,
      setChart: (chart, interpretation) => set({ lastChart: chart, lastInterpretation: interpretation }),
      clearChart: () => set({ lastChart: null, lastInterpretation: null }),
    }),
    { name: 'astraverse-chart' }
  )
);

interface UserPrefs {
  selectedSign: string | null;
  setSelectedSign: (sign: string) => void;
}

export const usePrefsStore = create<UserPrefs>()(
  persist(
    (set) => ({
      selectedSign: null,
      setSelectedSign: (sign) => set({ selectedSign: sign }),
    }),
    { name: 'astraverse-prefs' }
  )
);
