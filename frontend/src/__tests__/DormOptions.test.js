import { DormOptions } from "../data/DormOptions"; 

describe("DormOptions structure", () => {
  it("is an array", () => {
    expect(Array.isArray(DormOptions)).toBe(true);
  });

  it("each item has 'school' as string and 'dorms' as non-empty array", () => {
    DormOptions.forEach((entry) => {
      expect(typeof entry.school).toBe("string");
      expect(Array.isArray(entry.dorms)).toBe(true);
      expect(entry.dorms.length).toBeGreaterThan(0);
    });
  });

  it("contains at least one school with multiple dorms", () => {
    const hasMultipleDorms = DormOptions.some((entry) => entry.dorms.length > 1);
    expect(hasMultipleDorms).toBe(true);
  });

  it("includes a specific known school and dorm for sanity check", () => {
    const brock = DormOptions.find((entry) => entry.school === "Brock University");
    expect(brock).toBeDefined();
    expect(brock.dorms).toContain("Vallee Residence");
  });

  it("no entry has undefined or null fields", () => {
    DormOptions.forEach((entry) => {
      expect(entry.school).toBeTruthy();
      expect(entry.dorms).toBeTruthy();
    });
  });
});
