import {
  getBedSizeForDorm,
  getCurrentUserBedSize,
  getRecommendationsForDorm,
  getAllBedSizes,
} from "../utils/bedSizeHelper";

import { DormChecklistItems } from "../data/dormChecklistItems";

jest.mock("../data/dormChecklistItems", () => ({
  DormChecklistItems: {
    "Twin Dorm": [{ id: 1, label: "Twin Sheet" }],
    "Twin XL Dorm": [{ id: 1, label: "Twin XL Sheet" }],
    "Double Dorm": [{ id: 1, label: "Double Sheet" }],
    "Double XL Dorm": [{ id: 1, label: "Double XL Sheet" }],
    "Queen Dorm": [{ id: 1, label: "Queen Sheet" }],
    "King Dorm": [{ id: 1, label: "King Sheet" }],
    "No Sheet Dorm": [{ id: 1, label: "Towel" }],
    "Empty Dorm": [],
    "Unmatched Sheet Dorm": [{ id: 1, label: "Magic Flying Sheet" }],
  },
}));

describe("✅ getBedSizeForDorm", () => {
  test("returns correct size for Twin", () => {
    expect(getBedSizeForDorm("Twin Dorm")).toBe("Twin");
  });

  test("returns correct size for Twin XL", () => {
    expect(getBedSizeForDorm("Twin XL Dorm")).toBe("Twin XL");
  });

  test("returns correct size for Double", () => {
    expect(getBedSizeForDorm("Double Dorm")).toBe("Double");
  });

  test("returns correct size for Double XL", () => {
    expect(getBedSizeForDorm("Double XL Dorm")).toBe("Double XL");
  });

  test("returns correct size for Queen", () => {
    expect(getBedSizeForDorm("Queen Dorm")).toBe("Queen");
  });

  test("returns correct size for King", () => {
    expect(getBedSizeForDorm("King Dorm")).toBe("King");
  });

  test("returns null when sheet exists but size doesn't match", () => {
    expect(getBedSizeForDorm("Unmatched Sheet Dorm")).toBe(null);
  });

  test("returns null when no sheet exists", () => {
    expect(getBedSizeForDorm("No Sheet Dorm")).toBe(null);
  });

  test("returns null when dorm is empty", () => {
    expect(getBedSizeForDorm("Empty Dorm")).toBe(null);
  });

  test("returns null when dorm does not exist", () => {
    expect(getBedSizeForDorm("Nonexistent Dorm")).toBe(null);
  });

  test("returns null when dormName is undefined", () => {
    expect(getBedSizeForDorm(undefined)).toBe(null);
  });
});

describe("✅ getCurrentUserBedSize", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("returns correct bed size when user email and info exist", () => {
    localStorage.setItem("userEmail", "test@example.com");
    localStorage.setItem("userInfo_test@example.com", JSON.stringify({ dorm: "Queen Dorm" }));

    expect(getCurrentUserBedSize()).toBe("Queen");
  });

  test("returns null if userEmail not in localStorage", () => {
    expect(getCurrentUserBedSize()).toBe(null);
  });

  test("returns null if userInfo not in localStorage", () => {
    localStorage.setItem("userEmail", "test@example.com");
    expect(getCurrentUserBedSize()).toBe(null);
  });

  test("returns null if JSON.parse fails", () => {
    localStorage.setItem("userEmail", "test@example.com");
    localStorage.setItem("userInfo_test@example.com", "INVALID_JSON");

    expect(getCurrentUserBedSize()).toBe(null);
  });
});

describe("✅ getRecommendationsForDorm", () => {
  test("returns structure with bed size and item list", () => {
    const result = getRecommendationsForDorm("King Dorm");
    expect(result).toEqual({
      bedSize: "King",
      dormName: "King Dorm",
      items: expect.any(Array),
      hasSpecificBedSize: true,
    });
  });

  test("returns structure with no bed size", () => {
    const result = getRecommendationsForDorm("No Sheet Dorm");
    expect(result.bedSize).toBe(null);
    expect(result.hasSpecificBedSize).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
  });

  test("returns empty item list for non-existent dorm", () => {
    const result = getRecommendationsForDorm("Fake Dorm");
    expect(result.items).toEqual([]);
  });
});

describe("✅ getAllBedSizes", () => {
  test("returns sorted array of unique sizes", () => {
    const result = getAllBedSizes();
    expect(result).toEqual(["Double", "Double XL", "King", "Queen", "Twin", "Twin XL"]);
  });
});
