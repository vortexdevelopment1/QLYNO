import { resolveBillingAuthority } from "../src/utils/billing-authority";

describe("server-authoritative billing resolution", () => {
  test.each([
    ["HOSPITAL", "HOSPITAL_ENCOUNTER", "HMS_CENTRAL"], ["HOSPITAL", "WALK_IN", "LIS_INTERNAL"], ["STANDALONE", "B2B_CLIENT", "LIS_INTERNAL"], ["B2B", "WALK_IN", "EXTERNAL_CLIENT"], ["HYBRID", "B2B_CLIENT", "EXTERNAL_CLIENT"], ["HYBRID", "HOSPITAL_ENCOUNTER", "HMS_CENTRAL"], ["HYBRID", "INTERNAL_NO_CHARGE", "NO_CHARGE"]
  ] as const)("%s + %s resolves exactly to %s", (mode, source, expected) => { expect(resolveBillingAuthority(mode, source)).toBe(expected); });
});
