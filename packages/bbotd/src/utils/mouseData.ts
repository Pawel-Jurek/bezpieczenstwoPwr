export class MouseData {
  private events: Array<{ x: number; y: number; timestamp: number }> = [];
  private startTime: number | null = null;
  private readonly target: EventTarget;

  constructor(target: EventTarget) {
    this.target = target;
  }

  addListeners() {
    this.target.addEventListener("mousemove", this.handleMouseMove);
  }

  removeListeners() {
    this.target.removeEventListener("mousemove", this.handleMouseMove);
  }

  private handleMouseMove = (e: Event) => {
    const now = Date.now();
    if (!this.startTime) this.startTime = now;

    if (!(e instanceof MouseEvent)) return;

    this.events.push({
      x: e.clientX,
      y: e.clientY,
      timestamp: now,
    });
  };

  get windowDuration(): number {
    return this.startTime ? Date.now() - this.startTime : 0;
  }

  getWindowFeatures(): number[] {
    if (this.events.length < 2) return [];

    // Calculate deltas
    const diffs = [];
    for (let i = 1; i < this.events.length; i++) {
      const dx = Math.abs(this.events[i]!.x - this.events[i - 1]!.x);
      const dy = Math.abs(this.events[i]!.y - this.events[i - 1]!.y);
      diffs.push({ dx, dy });
    }

    // Aggregations
    const dxVals = diffs.map((d) => d.dx);
    const dyVals = diffs.map((d) => d.dy);

    const dxMean = average(dxVals);
    const dyMean = average(dyVals);

    const features = [
      dxMean,
      standardDeviation(dxVals),
      sum(dxVals),
      dyMean,
      standardDeviation(dyVals),
      sum(dyVals),
      sum(dxVals) + sum(dyVals), // xy_total_activity
      standardDeviation(dxVals) + standardDeviation(dyVals), // xy_std_total
      dxMean + dyMean, // xy_mean_total
    ];

    return features;
  }

  resetWindow() {
    this.events = [];
    this.startTime = Date.now();
  }
}

// Helper functions
function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0);
}

function average(arr: number[]): number {
  return arr.length ? sum(arr) / arr.length : 0;
}

function standardDeviation(arr: number[]): number {
  if (arr.length < 2) return 0;
  const avg = average(arr);
  const variance = sum(arr.map((x) => Math.pow(x - avg, 2))) / (arr.length - 1);
  return Math.sqrt(variance);
}
