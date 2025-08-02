import { countryCurrency } from "../data/countryCurrency";

describe("countryCurrency data", () => {
  test("should be a non-empty array", () => {
    expect(Array.isArray(countryCurrency)).toBe(true);
    expect(countryCurrency.length).toBeGreaterThan(0);
  });

  test("each entry should have country and currency_code fields", () => {
    countryCurrency.forEach((entry) => {
      expect(entry).toHaveProperty("country");
      expect(entry).toHaveProperty("currency_code");
      expect(typeof entry.country).toBe("string");
      // currency_code could be null (e.g., Palestine), so check only for type when not null
      if (entry.currency_code !== null) {
        expect(typeof entry.currency_code).toBe("string");
      }
    });
  });

  test("should include specific known country/currency_code pairs", () => {
    const china = countryCurrency.find((c) => c.country === "China");
    expect(china).toBeDefined();
    expect(china.currency_code).toBe("CNY");

    const canada = countryCurrency.find((c) => c.country === "Canada");
    expect(canada).toBeDefined();
    expect(canada.currency_code).toBe("CAD");

    const palestine = countryCurrency.find((c) => c.country === "Palestine");
    expect(palestine).toBeDefined();
    expect(palestine.currency_code).toBeNull();
  });

  test("all country names should be unique", () => {
    const names = countryCurrency.map((c) => c.country);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });
});
