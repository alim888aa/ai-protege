import assert from "node:assert/strict";
import test from "node:test";
import {
  LANDING_DEMO_DAILY_LIMIT,
  dailyDemoQuotaAvailable,
  landingDemoUsageDay,
} from "./landingDemoQuota.ts";

test("allows requests below the approved daily limit", () => {
  assert.equal(dailyDemoQuotaAvailable(LANDING_DEMO_DAILY_LIMIT - 1), true);
});

test("blocks requests at the approved daily limit", () => {
  assert.equal(dailyDemoQuotaAvailable(LANDING_DEMO_DAILY_LIMIT), false);
});

test("uses UTC calendar days for quota buckets", () => {
  assert.equal(
    landingDemoUsageDay(Date.parse("2026-07-15T23:59:59.999Z")),
    "2026-07-15"
  );
  assert.equal(
    landingDemoUsageDay(Date.parse("2026-07-16T00:00:00.000Z")),
    "2026-07-16"
  );
});
