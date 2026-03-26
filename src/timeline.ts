import type { PelletGrid, AnimationTimeline } from "./types.js";

// Constant pixel speed: time allocated proportional to distance traveled.
// Both keyPoints and keyTimes track cumulative distance so speed is uniform.
const PIXELS_PER_SECOND = 55;
const MIN_DURATION = 50;
const MAX_DURATION = 120;

export function buildTimeline(pelletGrid: PelletGrid): AnimationTimeline {
  const path = pelletGrid.path;
  if (path.length === 0) {
    return {
      pathD: "",
      totalDuration: MIN_DURATION,
      cellTimings: [],
      keyPoints: "0;1",
      keyTimes: "0;1",
    };
  }

  // Build SVG path string for animateMotion
  const first = path[0]!;
  const parts: string[] = [`M ${first.x},${first.y}`];
  for (let i = 1; i < path.length; i++) {
    parts.push(`L ${path[i]!.x},${path[i]!.y}`);
  }
  const pathD = parts.join(" ");

  const N = path.length;

  // Cumulative pixel distance along path
  const cumDist: number[] = [0];
  for (let i = 1; i < N; i++) {
    const dx = path[i]!.x - path[i - 1]!.x;
    const dy = path[i]!.y - path[i - 1]!.y;
    cumDist.push(cumDist[i - 1]! + Math.sqrt(dx * dx + dy * dy));
  }
  const totalDist = cumDist[N - 1]!;

  // Total duration based on pixel speed, clamped to a reasonable range
  const totalDuration = Math.max(
    MIN_DURATION,
    Math.min(MAX_DURATION, totalDist / PIXELS_PER_SECOND),
  );

  // Both keyTimes and keyPoints are distance-proportional → constant pixel speed.
  // No more dashing: inter-column jumps take proportionally longer time.
  const distValues =
    totalDist > 0
      ? cumDist.map((d) => d / totalDist)
      : path.map((_, i) => (N === 1 ? 0 : i / (N - 1)));

  // cellTimings: when does the chomper arrive at each cell (in seconds)
  const cellTimings = distValues.map((v) => v * totalDuration);

  const fmt = (v: number) => v.toFixed(4);
  const keyTimes = distValues.map(fmt).join(";");
  const keyPoints = distValues.map(fmt).join(";");

  return { pathD, totalDuration, cellTimings, keyPoints, keyTimes };
}
