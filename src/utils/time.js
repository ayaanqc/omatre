export function formatMinutesAgo(mins) {
  if (mins === 0) return 'Just now';
  return `${mins}m`;
}

export function calculateTurnPace(turnDuration, expectedDuration) {
  const delta = turnDuration - expectedDuration;
  if (delta > 15) return { status: 'OVER_TIME', label: `+${delta}m over pace`, alert: true };
  if (delta > 0) return { status: 'AT_LIMIT', label: `+${delta}m at pace`, alert: false };
  return { status: 'ON_SCHEDULE', label: `${Math.abs(delta)}m buffer`, alert: false };
}
