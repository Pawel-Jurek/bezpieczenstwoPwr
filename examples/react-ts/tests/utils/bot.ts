// Bot typing modes with their characteristics
export interface TypingMode {
  name: string;
  holdTime: { mean: number; stdDev?: number; range?: [number, number] };
  interval: { mean: number; stdDev?: number; range?: [number, number] };
}

export const BOT_MODES: TypingMode[] = [
  {
    name: "regular",
    holdTime: { mean: 100, stdDev: 0 },
    interval: { mean: 150, stdDev: 0 },
  },
  {
    name: "fast",
    holdTime: { mean: 80, stdDev: 5 },
    interval: { mean: 100, stdDev: 10 },
  },
  {
    name: "humanlike",
    holdTime: { mean: 120, stdDev: 20 },
    interval: { mean: 180, stdDev: 30 },
  },
  {
    name: "chaotic",
    holdTime: { mean: 150, stdDev: 50 },
    interval: { mean: 200, stdDev: 80 },
  },
  {
    name: "precise",
    holdTime: { mean: 90, range: [-2, 2] },
    interval: { mean: 130, range: [-2, 2] },
  },
];
