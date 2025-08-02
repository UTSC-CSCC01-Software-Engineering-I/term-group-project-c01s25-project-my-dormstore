import { SchoolOptions } from "../data/SchoolOptions"; 

describe("SchoolOptions data integrity", () => {
  it("is an array", () => {
    expect(Array.isArray(SchoolOptions)).toBe(true);
  });

  it("each option has value and label as matching strings", () => {
    SchoolOptions.forEach((option) => {
      expect(option).toHaveProperty("value");
      expect(option).toHaveProperty("label");
      expect(typeof option.value).toBe("string");
      expect(typeof option.label).toBe("string");
      expect(option.value).toBe(option.label);
      expect(option.value.trim()).not.toBe("");
    });
  });

  it("does not contain null or undefined entries", () => {
    SchoolOptions.forEach((option) => {
      expect(option).toBeTruthy();
    });
  });

  it("does not contain duplicate labels", () => {
    const labels = SchoolOptions.map((opt) => opt.label);
    const uniqueLabels = new Set(labels);
    expect(uniqueLabels.size).toBe(labels.length);
  });

  it("contains known entry for sanity check", () => {
    const tmu = SchoolOptions.find(
      (opt) => opt.value === "Toronto Metropolitan University"
    );
    expect(tmu).toBeDefined();
    expect(tmu.label).toBe("Toronto Metropolitan University");
  });
});
