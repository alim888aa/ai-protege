export const LANDING_DEMO_DAILY_LIMIT = 150;

export function landingDemoUsageDay(now: number) {
  return new Date(now).toISOString().slice(0, 10);
}

export function dailyDemoQuotaAvailable(count: number) {
  return count < LANDING_DEMO_DAILY_LIMIT;
}
